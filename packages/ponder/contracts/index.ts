import { Abi, Address } from "viem";

export type GenericContract = {
  address: Address;
  abi: Abi;
  inheritedFunctions?: any;
  external?: true;
};

export type GenericContractsDeclaration = {
  [chainId: number]: {
    [contractName: string]: GenericContract;
  };
};
