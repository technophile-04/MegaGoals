"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Address, AddressInput, EtherInput, InputBase } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [participantAddresses, setParticipantAddresses] = useState([""]);
  const [stakeAmount, setStakeAmount] = useState("");
  const [commitmentMessage, setCommitmentMessage] = useState("");
  const { writeContractAsync: writeGroupCommitmentContractAsync } = useScaffoldWriteContract("GroupCommitment");

  const handleAddAddress = () => {
    setParticipantAddresses([...participantAddresses, ""]);
  };

  const handleRemoveAddress = (index: number) => {
    const newAddresses = participantAddresses.filter((_, i) => i !== index);
    setParticipantAddresses(newAddresses);
  };

  const handleAddressChange = (index: number, value: string) => {
    const newAddresses = [...participantAddresses];
    newAddresses[index] = value;
    setParticipantAddresses(newAddresses);
  };

  const handleCreateGroupCommitment = async () => {
    try {
      const validAddresses = participantAddresses.filter(addr => addr.trim() !== "");
      console.log("Creating group commitment with addresses:", validAddresses);
      console.log("Commitment message:", commitmentMessage);
      await writeGroupCommitmentContractAsync({
        functionName: "createCommitment",
        args: [validAddresses, commitmentMessage],
        value: parseEther(stakeAmount),
      });
    } catch (e) {
      console.error("Error creating group commitment:", e);
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-full max-w-2xl">
        <h1 className="text-center mb-8">
          <span className="block text-2xl mb-2">Welcome to</span>
          <span className="block text-4xl font-bold">Group Commitment</span>
        </h1>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <p className="font-medium">Connected Address:</p>
              <Address address={connectedAddress} />
            </div>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Commitment Message</span>
                </label>
                <InputBase value={commitmentMessage} onChange={setCommitmentMessage} />
              </div>
              <div className="form-control space-y-2">
                <label className="label">
                  <span className="label-text">participant addresses</span>
                </label>
                {participantAddresses.map((address, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <AddressInput
                      value={address}
                      onChange={value => handleAddressChange(index, value)}
                      placeholder={`Participant ${index + 1} Address`}
                    />
                    {index > 0 && (
                      <button onClick={() => handleRemoveAddress(index)} className="btn btn-circle btn-sm btn-error">
                        <MinusIcon className="w-[20px] h-[20px]" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button onClick={handleAddAddress} className="btn btn-circle btn-sm btn-primary">
                <PlusIcon className="w-[20px] h-[20px]" />
              </button>
              <EtherInput value={stakeAmount} onChange={setStakeAmount} placeholder="Stake Amount (ETH)" />
              <button onClick={handleCreateGroupCommitment} className="btn btn-primary w-full">
                Create Group Commitment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
