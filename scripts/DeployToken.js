import hre from "hardhat";

async function main() {
  // Clients viem fournis par Hardhat (template viem)
  const publicClient = await hre.viem.getPublicClient();
  const [deployer, user1] = await hre.viem.getWalletClients();

  // Déploiement du contrat (constructor(address initialOwner))
  const token = await hre.viem.deployContract("TontineToken", [
    deployer.account.address,
  ]);

  console.log("Deployer:", deployer.account.address);
  console.log("User1:", user1.account.address);
  console.log("TontineToken deployed at:", token.address);

  // Petit test rapide: mint 100 TONT à user1 (100 * 10^18)
  const amount = 100n * 10n ** 18n;

  const hash = await token.write.mint([user1.account.address, amount], {
    account: deployer.account,
  });

  await publicClient.waitForTransactionReceipt({ hash });

  const bal = await token.read.balanceOf([user1.account.address]);
  console.log("User1 balance:", bal.toString());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
