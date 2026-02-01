import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;

describe("Système de Tontine - Test de Flux Logique", function () {
  let membership, avalisation, manager, usdt;
  let owner, membreA, membreB, avaliseur;
  const COTISATION = ethers.parseUnits("100", 6);

  beforeEach(async function () {
    [owner, membreA, membreB, avaliseur] = await ethers.getSigners();

    // Déploiement
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    usdt = await MockUSDT.deploy();

    const TontineMembership = await ethers.getContractFactory("TontineMembership");
    membership = await TontineMembership.deploy(owner.address, "Tontine NFT", "TNFT");

    const AvalisationManager = await ethers.getContractFactory("AvalisationManager");
    avalisation = await AvalisationManager.deploy(await membership.getAddress());

    const TontineManager = await ethers.getContractFactory("TontineManager");
    manager = await TontineManager.deploy(
      await membership.getAddress(),
      await avalisation.getAddress(),
      await usdt.getAddress()
    );

    // Rôles
    const MANAGER_ROLE = await avalisation.MANAGER_ROLE();
    await membership.grantRole(MANAGER_ROLE, await manager.getAddress());
    await avalisation.grantRole(MANAGER_ROLE, await manager.getAddress());

    // Mint et Approve
    await usdt.mint(membreA.address, ethers.parseUnits("1000", 6));
    await usdt.mint(membreB.address, ethers.parseUnits("1000", 6));
    await usdt.connect(membreA).approve(await manager.getAddress(), ethers.MaxUint256);
    await usdt.connect(membreB).approve(await manager.getAddress(), ethers.MaxUint256);
  });

  it("Devrait dérouler 2 cycles complets avec retenue à la source", async function () {
    const tontineId = 1;
    await avalisation.createTontine(tontineId, COTISATION);
    const data = { name: "Test", avaliseur: avaliseur.address, ipfsHash: "h", uri: "u", level: 0 };
    
    // Inscriptions
    await manager.registerMember(tontineId, membreA.address, data); // ID 1
    await manager.registerMember(tontineId, membreB.address, data); // ID 2

    // --- CYCLE 1 ---
    // A et B paient 100 chacun.
    await manager.connect(membreA).payCotisation(tontineId, 1);
    await manager.connect(membreB).payCotisation(tontineId, 2);

    // Vérification Cycle 1 : A (bénéficiaire) doit avoir reçu 100 (Cagnotte 200 - 100 retenus)
    // Son solde initial était 1000, il a payé 100, il reçoit 100 -> solde final 1000.
    expect(await usdt.balanceOf(membreA.address)).to.equal(ethers.parseUnits("1000", 6));

    // --- CYCLE 2 ---
    // Le contrat a déjà marqué le Token 1 (A) comme payé pour le cycle 2.
    // On vérifie le statut dans le contrat
    expect(await manager.hasPaid(tontineId, 2, 1)).to.be.true;

    const soldeInitialB = await usdt.balanceOf(membreB.address);

    // Seul B doit payer sa cotisation manuellement
    await manager.connect(membreB).payCotisation(tontineId, 2);

    // Vérification Cycle 2 : B (dernier bénéficiaire) reçoit tout (100 retenus + 100 de sa propre poche)
    // B avait 900 (après payement C1), il paie 100 (C2) -> 800. Il reçoit 200 -> 1000.
    expect(await usdt.balanceOf(membreB.address)).to.equal(ethers.parseUnits("1000", 6));

    // Vérification finale : La tontine est terminée (plus de cycle actif)
    const cycle2 = await manager.cycles(tontineId, 2);
    expect(cycle2.isActive).to.be.false;
    expect(cycle2.isDistributed).to.be.true;
  });
});