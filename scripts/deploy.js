import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("--- Début du déploiement ---");
  console.log("Compte deployer :", deployer.address);

  // 1. Déploiement du Mock USDT (Uniquement pour les tests/dev)
  console.log("\nDéploiement de MockUSDT...");
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const usdt = await MockUSDT.deploy();
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  console.log("MockUSDT déployé à :", usdtAddress);

  // 2. Déploiement de TontineMembership
  console.log("\nDéploiement de TontineMembership...");
  const TontineMembership = await ethers.getContractFactory("TontineMembership");
  const membership = await TontineMembership.deploy(deployer.address, "Tontine NFT", "TNFT");
  await membership.waitForDeployment();
  const membershipAddress = await membership.getAddress();
  console.log("Membership déployé à :", membershipAddress);

  // 3. Déploiement de AvalisationManager
  console.log("\nDéploiement de AvalisationManager...");
  const AvalisationManager = await ethers.getContractFactory("AvalisationManager");
  const avalisation = await AvalisationManager.deploy(membershipAddress);
  await avalisation.waitForDeployment();
  const avalisationAddress = await avalisation.getAddress();
  console.log("AvalisationManager déployé à :", avalisationAddress);

  // 4. Déploiement de TontineManager
  console.log("\nDéploiement de TontineManager...");
  const TontineManager = await ethers.getContractFactory("TontineManager");
  const manager = await TontineManager.deploy(membershipAddress, avalisationAddress, usdtAddress);
  await manager.waitForDeployment();
  const managerAddress = await manager.getAddress();
  console.log("TontineManager déployé à :", managerAddress);

  // 5. Configuration des Rôles
  console.log("\nConfiguration des rôles...");
  const MANAGER_ROLE = await avalisation.MANAGER_ROLE();
  
  // Le Manager doit pouvoir minter des NFT et gérer l'ordre des membres
  await membership.grantRole(MANAGER_ROLE, managerAddress);
  await avalisation.grantRole(MANAGER_ROLE, managerAddress);
  
  console.log("Rôles configurés avec succès !");
  console.log("--- Déploiement terminé ---");

  // Recapitulatif pour ton frontend
  console.log("\n--- RÉCAPITULATIF DES ADRESSES ---");
  console.table({
    USDT: usdtAddress,
    Membership: membershipAddress,
    Avalisation: avalisationAddress,
    Manager: managerAddress
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });