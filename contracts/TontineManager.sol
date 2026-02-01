// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./TontineMembership.sol";
import "./AvalisationManager.sol";


contract TontineManager is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant PRESIDENT_ROLE = keccak256("PRESIDENT_ROLE");
    TontineMembership public immutable membership;
    AvalisationManager public immutable avalisation;
    IERC20 public immutable usdt;

    struct Cycle {
        uint256 tontineId;
        uint256 paymentDeadline;
        uint256 totalCollected;
        uint256 beneficiaryTokenId;
        address beneficiaryAddress;
        bool isDistributed;
        bool isActive;
    }

    mapping(uint256 => uint256) public currentCycle;
    mapping(uint256 => mapping(uint256 => Cycle)) public cycles;
    mapping(uint256 => mapping(uint256 => mapping(uint256 => bool))) public hasPaid;

    event CotisationPaid(uint256 indexed tontineId, uint256 indexed tokenId, uint256 amount);
    event BenefitDistributed(uint256 indexed tontineId, address beneficiary, uint256 amountNet);
    event NextCycleStarted(uint256 indexed tontineId, uint256 cycleId, address beneficiary);

    constructor(address _membership, address _avalisation, address _usdt) {
        membership = TontineMembership(_membership);
        avalisation = AvalisationManager(_avalisation);
        usdt = IERC20(_usdt);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PRESIDENT_ROLE, msg.sender);
    }

    function registerMember(
        uint256 tontineId,
        address member,
        MemberRegistration calldata data 
    ) external onlyRole(PRESIDENT_ROLE) returns (uint256) {
        AvalisationManager.TontineConfig memory config = avalisation.getTontineConfig(tontineId);
        require(config.isActive, "Tontine fermee");

        uint256 tokenId = membership.mintMembership(member, config.cotisationAmount, 0, data);
        avalisation.registerAvalisation(tontineId, data.avaliseur, member, tokenId);

        if (currentCycle[tontineId] == 0) {
            _internalStartNextCycle(tontineId, tokenId, member);
        }
        return tokenId;
    }

    function payCotisation(uint256 tontineId, uint256 tokenId) external nonReentrant {
        AvalisationManager.TontineConfig memory config = avalisation.getTontineConfig(tontineId);
        uint256 cycleId = currentCycle[tontineId];
        Cycle storage cycle = cycles[tontineId][cycleId];
        
        require(cycle.isActive, "Pas de cycle actif");
        require(!hasPaid[tontineId][cycleId][tokenId], "Deja paye");
        require(membership.ownerOf(tokenId) == msg.sender, "Pas ton token");

        usdt.safeTransferFrom(msg.sender, address(this), config.cotisationAmount);
        
        hasPaid[tontineId][cycleId][tokenId] = true;
        cycle.totalCollected += config.cotisationAmount;

        emit CotisationPaid(tontineId, tokenId, config.cotisationAmount);

        if (cycle.totalCollected >= (config.cotisationAmount * config.memberCount)) {
            _distribute(tontineId, cycleId);
        }
    }

    function _distribute(uint256 tontineId, uint256 cycleId) internal {
        Cycle storage cycle = cycles[tontineId][cycleId];
        AvalisationManager.TontineConfig memory config = avalisation.getTontineConfig(tontineId);
        
        cycle.isDistributed = true;
        cycle.isActive = false;

        uint256 currentBeneficiaryTokenId = cycle.beneficiaryTokenId;
        address currentBeneficiaryAddress = cycle.beneficiaryAddress;

        // 1. Marquer le bénéfice (retrait de la liste)
        avalisation.processBenefit(tontineId, currentBeneficiaryTokenId);
        membership.markAsBenefited(currentBeneficiaryTokenId);

        // 2. Déterminer le tour suivant
        bool hasNext = false;
        uint256 nextTokenId;
        address nextAddr;
        try avalisation.getNextBeneficiary(tontineId) returns (uint256 _t, address _a) {
            hasNext = true;
            nextTokenId = _t;
            nextAddr = _a;
        } catch {}

        // 3. Calcul du montant (Retenue si tontine continue)
        uint256 amountToTransfer = cycle.totalCollected;
        
        if (hasNext) {
            amountToTransfer -= config.cotisationAmount;
            _internalStartNextCycle(tontineId, nextTokenId, nextAddr);
            
            uint256 nextCycleId = currentCycle[tontineId];
            hasPaid[tontineId][nextCycleId][currentBeneficiaryTokenId] = true;
            cycles[tontineId][nextCycleId].totalCollected += config.cotisationAmount;
            
            emit CotisationPaid(tontineId, currentBeneficiaryTokenId, config.cotisationAmount);
        }

        usdt.safeTransfer(currentBeneficiaryAddress, amountToTransfer);
        emit BenefitDistributed(tontineId, currentBeneficiaryAddress, amountToTransfer);
    }

    function _internalStartNextCycle(uint256 tontineId, uint256 bTokenId, address bAddr) internal {
        uint256 nextId = currentCycle[tontineId] + 1;
        cycles[tontineId][nextId] = Cycle({
            tontineId: tontineId,
            paymentDeadline: block.timestamp + 7 days,
            totalCollected: 0,
            beneficiaryTokenId: bTokenId,
            beneficiaryAddress: bAddr,
            isDistributed: false,
            isActive: true
        });
        currentCycle[tontineId] = nextId;
        emit NextCycleStarted(tontineId, nextId, bAddr);
    }
}