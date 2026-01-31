import { expect } from "chai";
// Syntaxe obligatoire pour ESM avec Hardhat
import pkg from "hardhat";
const { ethers } = pkg;

describe("Ma Plateforme de Tontine", function () {
    let factory;
    let deployer;
    let utilisateur;
    let adresseTontine;
    let tontine;

    it("Devrait installer l'environnement de test", async function () {
        // Récupération des comptes
        [deployer, utilisateur] = await ethers.getSigners();
    });

    it("Devrait déployer la Factory et créer une tontine", async function () {
        // Déploiement
        const Factory = await ethers.getContractFactory("TontineFactory");
        factory = await Factory.deploy();
        const factoryAddress = await factory.getAddress();
        console.log("   Factory déployée à :", factoryAddress);

        // Création de la tontine
        const tx = await factory.connect(utilisateur).createTontine("Tontine Vacances", "TVAC");
        await tx.wait();

        // Récupération de l'adresse
        adresseTontine = await factory.allTontines(0);
        console.log("   Nouvelle tontine créée à :", adresseTontine);

        expect(adresseTontine).to.not.equal(ethers.ZeroAddress);
    });

    it("Devrait permettre au Président de minter un membre", async function () {
        // Instance du contrat
        tontine = await ethers.getContractAt("TontineMembership", adresseTontine);

        // Test du Mint (viaIR gère la complexité ici)
        const txMint = await tontine.connect(utilisateur).mintMembership(
            deployer.address, 
            "MENSAH OLIVIER", 
            utilisateur.address, 
            ethers.parseEther("0.1"), 
            0, // Level.STANDARD
            ethers.parseEther("0.5"), 
            "hash_ipfs_123", 
            "https://mon-uri.com/1"
        );
        await txMint.wait();

        const membre = await tontine.members(1);
        expect(membre.name).to.equal("MENSAH OLIVIER");
        console.log("   Membre minté avec succès !");
    });
});