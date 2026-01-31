import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;

describe("Ma Plateforme de Tontine", function () {
  it("Devrait créer une nouvelle tontine via la Factory", async function () {
    // 1. On récupère les comptes de test (signers)
    const [deployer, utilisateur] = await ethers.getSigners();

    // 2. On déploie la Factory
    const Factory = await ethers.getContractFactory("TontineFactory");
    const factory = await Factory.deploy();
    console.log("Factory déployée à :", await factory.getAddress());

    // 3. L'utilisateur crée sa tontine
    const tx = await factory.connect(utilisateur).createTontine("Tontine Vacances", "TVAC");
    await tx.wait();

    // 4. On vérifie que la tontine existe bien dans le tableau
    const adresseTontine = await factory.allTontines(0);
    console.log("Nouvelle tontine créée pour l'utilisateur à :", adresseTontine);

    expect(adresseTontine).to.not.equal("0x0000000000000000000000000000000000000000");
  });
});