import { createConfig } from "@ponder/core";
import { http } from "viem";

import deployedContracts from "./contracts/deployedContracts";

export default createConfig({
  networks: {
    hardhat: {
      chainId: 31337,
      transport: http(),
    },
  },
  contracts: {
    CommitmentContract: {
      network: "hardhat",
      abi: deployedContracts[31337].CommitmentContract.abi,
      address: deployedContracts[31337].CommitmentContract.address,
      startBlock: 0,
    },
  },
});
