// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * TontineToken (TONT)
 * Token utilitaire pour simuler les cotisations (ex: FCFA tokenisé) en test/local.
 * Le owner peut "mint" des tokens pour distribuer aux membres.
 */
contract TontineToken is ERC20, Ownable {
    constructor(address initialOwner) ERC20("Tontine Token", "TONT") Ownable(initialOwner) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
