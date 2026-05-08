import { ethers } from "hardhat";
import { arcTestnet, CONTRACT_ADDRESSES } from "../src/lib/chain/config";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying ArcPredict with account:", deployer.address);
  console.log("Network: Arc Testnet (chainId", arcTestnet.id, ")");
  console.log("USDC Address:", CONTRACT_ADDRESSES.USDC);

  const ArcPredict = await ethers.getContractFactory("ArcPredict");
  const contract = await ArcPredict.deploy(CONTRACT_ADDRESSES.USDC);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\n✅  ArcPredict deployed to:", address);
  console.log(
    "\nAdd to your .env:\n  NEXT_PUBLIC_ARC_PREDICT_ADDRESS=" + address
  );
  console.log(
    "\nVerify on explorer:\n  " +
      arcTestnet.blockExplorers.default.url +
      "/address/" +
      address
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
