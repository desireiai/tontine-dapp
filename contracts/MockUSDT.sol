// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDT
 * @dev Token USDT simulé avec 6 décimales (identique au vrai USDT)
 */
contract MockUSDT is ERC20 {
    // On définit explicitement les 6 décimales
    constructor() ERC20("Tether USD", "USDT") {
        // On mint 1 million d'USDT pour le déploieur
        // 1_000_000 * 10^6
        _mint(msg.sender, 1_000_000 * 10**decimals());
    }

    /**
     * @dev On surcharge la fonction decimals() d'OpenZeppelin
     * Par défaut ERC20 est à 18, ici on force à 6.
     */
    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

    /**
     * @dev Permet de générer des jetons pour les tests
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @dev Permet de détruire des jetons
     */
    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
}