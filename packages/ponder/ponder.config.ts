import { createConfig } from "@ponder/core";
import { http } from "viem";

import deployedContracts from "./contracts/deployedContracts";
import { optimism } from "viem/chains";

export default createConfig({
  networks: {
    optimism: {
      chainId: optimism.id,
      transport: http(),
    },
  },
  contracts: {
    CommitmentContract: {
      network: "optimism",
      abi: deployedContracts[optimism.id].CommitmentContract.abi,
      address: deployedContracts[optimism.id].CommitmentContract.address,
      startBlock: 126523619,
    },
  },
});
