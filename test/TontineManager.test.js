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
      ethers.parseEther("1") // cotisation = 1 ETH (ethers v6)
    );

    await tontine.waitForDeployment(); // ethers v6
  });

  it("Doit définir correctement le président", async function () {
    expect(await tontine.president()).to.equal(president.address);
  });

  it("Doit permettre au président d'ajouter des membres", async function () {
    await tontine.addMember(member1.address);
    const firstMember = await tontine.members(0);
    expect(firstMember).to.equal(member1.address);
  });

  it("Un membre peut payer la cotisation", async function () {
    await tontine.startCycle();
    await tontine.addMember(member1.address);

    await expect(
      tontine.connect(member1).payCotisation({
        value: ethers.parseEther("1"),
      })
    ).to.not.be.reverted;
  });

  it("Le président peut distribuer la tontine", async function () {
    await tontine.startCycle();
    await tontine.addMember(member1.address);

    await tontine.connect(member1).payCotisation({
      value: ethers.parseEther("1"),
    });

    await expect(() =>
      tontine.connect(president).distribute()
    ).to.changeEtherBalance(member1, ethers.parseEther("1"));
  });
});
