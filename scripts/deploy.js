async function main() {
  const TontineManager = await ethers.getContractFactory("TontineManager");
  const tontine = await TontineManager.deploy(
    ethers.parseEther("1")
  );

  await tontine.waitForDeployment();
  console.log("TontineManager déployé à :", await tontine.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
