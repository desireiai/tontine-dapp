// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./TontineMembership.sol";
import "./interfaces/ITontineManager.sol";

contract AvalisationManager is AccessControl {
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    TontineMembership public immutable membership;
    ITontineManager public tontineManager;

    uint8 public maxAvalisesPerAvaliseur = 3;

    mapping(address => uint256) public avaliseCount;

    event AvalisationRegistered(address indexed avaliseur, address indexed avalise);
    event AvaliseurMovedToBack(address indexed avaliseur, address indexed triggeredBy);

    constructor(address manager, address membership_) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, manager);
        membership = TontineMembership(membership_);
    }

    function setTontineManager(address tm) external onlyRole(DEFAULT_ADMIN_ROLE) {
        tontineManager = ITontineManager(tm);
    }

    function setMaxAvalises(uint8 max_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(max_ >= 1 && max_ <= 20, "Invalid max");
        maxAvalisesPerAvaliseur = max_;
    }

    function registerAvalisation(address avaliseur, address avalise) external onlyRole(MANAGER_ROLE) {
        require(avaliseur != address(0) && avalise != address(0), "Invalid");
        require(avaliseur != avalise, "Self aval forbidden");
        require(avaliseCount[avaliseur] < maxAvalisesPerAvaliseur, "Avaliseur limit reached");

        avaliseCount[avaliseur] += 1;
        emit AvalisationRegistered(avaliseur, avalise);
    }

    /// @notice Quand beneficiary reçoit le payout: remonter la chaîne avaliseur->... et déplacer en queue les avaliseurs non-bénéficiaires
    function onBeneficiaryPaid(address beneficiary) external onlyRole(MANAGER_ROLE) {
        address current = beneficiary;

        while (true) {
            address avaliseur = membership.getAvaliseur(current);
            if (avaliseur == address(0)) break;

            if (!tontineManager.isActiveMember(avaliseur)) break;
            if (tontineManager.hasBenefited(avaliseur)) break;

            tontineManager.moveToBack(avaliseur);
            emit AvaliseurMovedToBack(avaliseur, beneficiary);

            current = avaliseur; // récursif
        }
    }
}
