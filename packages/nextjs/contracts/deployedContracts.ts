/**
 * This file is autogenerated by Scaffold-ETH.
 * You should not edit it manually or your changes might be overwritten.
 */
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const deployedContracts = {
  31337: {
    CommitmentContract: {
      address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      abi: [
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "commitmentId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "address[]",
              name: "completedParticipants",
              type: "address[]",
            },
          ],
          name: "CommitmentCompleted",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "commitmentId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "address",
              name: "creator",
              type: "address",
            },
            {
              indexed: false,
              internalType: "string",
              name: "description",
              type: "string",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "stakeAmount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "endDate",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "proofFrequency",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "bool",
              name: "isGroupCommitment",
              type: "bool",
            },
          ],
          name: "CommitmentCreated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "uint256",
              name: "commitmentId",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "address",
              name: "participant",
              type: "address",
            },
          ],
          name: "ParticipantJoined",
          type: "event",
        },
        {
          inputs: [],
          name: "commitmentCounter",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "commitments",
          outputs: [
            {
              internalType: "address",
              name: "creator",
              type: "address",
            },
            {
              internalType: "string",
              name: "description",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "stakeAmount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "endDate",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "isGroupCommitment",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "proofFrequency",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "isCompleted",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_commitmentId",
              type: "uint256",
            },
            {
              internalType: "address[]",
              name: "_completedParticipants",
              type: "address[]",
            },
          ],
          name: "completeCommitment",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "string",
              name: "_description",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "_stakeAmount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_endDate",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "proofFrequency",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "_isGroupCommitment",
              type: "bool",
            },
          ],
          name: "createCommitment",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_commitmentId",
              type: "uint256",
            },
          ],
          name: "getParticipants",
          outputs: [
            {
              internalType: "address[]",
              name: "",
              type: "address[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_commitmentId",
              type: "uint256",
            },
          ],
          name: "joinCommitment",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
      ],
      inheritedFunctions: {},
    },
  },
} as const;

export default deployedContracts satisfies GenericContractsDeclaration;
