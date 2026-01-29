const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TontineManager", function () {
  let tontine;
  let president;
  let member1;
  let member2;

  beforeEach(async function () {
    [president, member1, member2] = await ethers.getSigners();

    const TontineManager = await ethers.getContractFactory("TontineManager");
    tontine = await TontineManager.deploy(
      ethers.parseEther("1")
    );

    await tontine.waitForDeployment();
  });

  it("definit correctement le president", async function () {
    expect(await tontine.president()).to.equal(president.address);
  });

  it("permet au president d'ajouter un membre", async function () {
    await tontine.addMember(member1.address);

    const members = await tontine.getMembers();
    expect(members.length).to.equal(1);
    expect(members[0]).to.equal(member1.address);
  });

  it("empeche un non-membre de payer la cotisation", async function () {
    await tontine.startCycle();

    await expect(
      tontine.connect(member1).payCotisation({
        value: ethers.parseEther("1"),
      })
    ).to.be.revertedWith("Not a member");
  });

  it("permet a un membre de payer la cotisation", async function () {
    await tontine.addMember(member1.address);
    await tontine.startCycle();

    await expect(
      tontine.connect(member1).payCotisation({
        value: ethers.parseEther("1"),
      })
    ).to.not.be.reverted;
  });

  it("permet au president de distribuer la tontine", async function () {
    await tontine.addMember(member1.address);
    await tontine.startCycle();

    await tontine.connect(member1).payCotisation({
      value: ethers.parseEther("1"),
    });

    await expect(() =>
      tontine.distribute()
    ).to.changeEtherBalance(member1, ethers.parseEther("1"));
  });
});
