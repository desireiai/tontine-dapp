import { expect } from "chai";
import { ethers } from "hardhat";

describe("TontineManager", function () {

  async function deployFixture() {
    const [president, member1, member2] = await ethers.getSigners();

    const TontineManager = await ethers.getContractFactory("TontineManager");
    const tontine = await TontineManager.deploy(
      ethers.parseEther("1") // cotisation = 1 ETH
    );

    return { tontine, president, member1, member2 };
  }

  it("Doit définir correctement le président", async function () {
    const { tontine, president } = await deployFixture();
    expect(await tontine.president()).to.equal(president.address);
  });

  it("Doit permettre au président d'ajouter des membres", async function () {
    const { tontine, member1 } = await deployFixture();

    await tontine.addMember(member1.address);
    const firstMember = await tontine.members(0);

    expect(firstMember).to.equal(member1.address);
  });

  it("Un membre peut payer la cotisation", async function () {
    const { tontine, member1 } = await deployFixture();

    await tontine.startCycle();
    await tontine.addMember(member1.address);

    await expect(
      tontine.connect(member1).payCotisation({
        value: ethers.parseEther("1"),
      })
    ).to.not.be.reverted;
  });

  it("Le président peut distribuer la tontine", async function () {
    const { tontine, president, member1 } = await deployFixture();

    await tontine.startCycle();
    await tontine.addMember(member1.address);

    await tontine.connect(member1).payCotisation({
      value: ethers.parseEther("1"),
    });

    await expect(tontine.connect(president).distribute())
      .to.changeEtherBalance(member1, ethers.parseEther("1"));
  });
});
