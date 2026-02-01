// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./TontineMembership.sol";

contract AvalisationManager is AccessControl {
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    struct TontineConfig {
        uint256 cotisationAmount;
        uint32 memberCount;
        bool isActive;
    }

    TontineMembership public immutable membership;

    mapping(uint256 => TontineConfig) public tontines;
    mapping(uint256 => mapping(address => address)) public avaliseurs;
    mapping(uint256 => uint256[]) public memberOrder;
    mapping(uint256 => mapping(uint256 => bool)) public hasBenefited;

    constructor(address _membership) {
        membership = TontineMembership(_membership);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender); 
    }

    function createTontine(uint256 tontineId, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        tontines[tontineId] = TontineConfig(amount, 0, true);
    }

    function registerAvalisation(uint256 tontineId, address avaliseur, address avalise, uint256 tokenId) 
        external onlyRole(MANAGER_ROLE) 
    {
        require(avaliseurs[tontineId][avalise] == address(0), "Deja enregistre");
        avaliseurs[tontineId][avalise] = avaliseur;
        memberOrder[tontineId].push(tokenId);
        tontines[tontineId].memberCount++;
    }

    function processBenefit(uint256 tontineId, uint256 tokenId) external onlyRole(MANAGER_ROLE) {
        require(!hasBenefited[tontineId][tokenId], "Deja beneficie");
        hasBenefited[tontineId][tokenId] = true;
        
        address beneficiary = membership.ownerOf(tokenId);
        _reorganize(tontineId, beneficiary);
        _removeFromOrder(tontineId, tokenId);
    }

    function _reorganize(uint256 tontineId, address current) internal {
        address avaliseur = avaliseurs[tontineId][current];
        if (avaliseur != address(0)) {
            uint256[] memory tokens = membership.getTokensOf(avaliseur);
            if (tokens.length > 0) {
                uint256 avaliseurTokenId = tokens[0];
                if (!hasBenefited[tontineId][avaliseurTokenId]) {
                    _moveToEnd(tontineId, avaliseurTokenId);
                }
            }
        }
    }

    function _moveToEnd(uint256 tontineId, uint256 tokenId) internal {
        uint256[] storage order = memberOrder[tontineId];
        uint256 len = order.length;
        int256 foundIdx = -1;

        for (uint256 i = 0; i < len; i++) {
            if (order[i] == tokenId) {
                foundIdx = int256(i);
                break;
            }
        }

        if (foundIdx != -1) {
            uint256 idx = uint256(foundIdx);
            for (uint256 j = idx; j < len - 1; j++) {
                order[j] = order[j + 1];
            }
            order[len - 1] = tokenId;
        }
    }

    function _removeFromOrder(uint256 tontineId, uint256 tokenId) internal {
        uint256[] storage order = memberOrder[tontineId];
        uint256 len = order.length;
        uint256 indexToRemove = len;

        for (uint256 i = 0; i < len; i++) {
            if (order[i] == tokenId) {
                indexToRemove = i;
                break;
            }
        }

        if (indexToRemove < len) {
            for (uint256 i = indexToRemove; i < len - 1; i++) {
                order[i] = order[i + 1];
            }
            order.pop();
        }
    }

    function getTontineConfig(uint256 id) external view returns (TontineConfig memory) { return tontines[id]; }
    function memberHasBenefited(uint256 id, uint256 tid) external view returns (bool) { return hasBenefited[id][tid]; }
    
    function getNextBeneficiary(uint256 id) external view returns (uint256 tokenId, address member) {
        require(memberOrder[id].length > 0, "Fin de tontine");
        tokenId = memberOrder[id][0];
        member = membership.ownerOf(tokenId);
    }

    function getMemberOrder(uint256 tontineId) external view returns (uint256[] memory) {
        return memberOrder[tontineId];
    }
}