import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;

describe("Ma Plateforme de Tontine - Membership", function () {
  let membership, owner, membre;

  beforeEach(async function () {
    [owner, membre] = await ethers.getSigners();
    const TontineMembership = await ethers.getContractFactory("TontineMembership");
    membership = await TontineMembership.deploy(owner.address, "Tontine NFT", "TNFT");
  });

  it("Devrait permettre au Président de minter un membre", async function () {
    const COTISATION = ethers.parseUnits("100", 6);
    const memberData = {
      name: "MENSAH OLIVIER",
      avaliseur: owner.address,
      ipfsHash: "hash_ipfs_123",
      uri: "https://mon-uri.com/1",
      level: 0
    };

    await expect(membership.mintMembership(membre.address, COTISATION, 0, memberData))
      .to.emit(membership, "Transfer");
  });
});