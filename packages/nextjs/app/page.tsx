"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { EtherInput, InputBase } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const Home: NextPage = () => {
  const [stakeAmount, setStakeAmount] = useState("");
  const [commitmentMessage, setCommitmentMessage] = useState("");
  const [duration, setDuration] = useState("");
  const [proofFrequency, setProofFrequency] = useState("");
  const [isGroupCommitment, setIsGroupCommitment] = useState(true);
  const { writeContractAsync: writeGroupCommitmentContractAsync } = useScaffoldWriteContract("CommitmentContract");

  const handleCreateGroupCommitment = async () => {
    try {
      if (!duration || !stakeAmount || !commitmentMessage) {
        return notification.error("Please fill all the fields");
      }
      await writeGroupCommitmentContractAsync({
        functionName: "createCommitment",
        args: [commitmentMessage, parseEther(stakeAmount), BigInt(duration), BigInt(proofFrequency), isGroupCommitment],
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
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Commitment Message</span>
                </label>
                <InputBase
                  placeholder="Go to gym for 30 days"
                  value={commitmentMessage}
                  onChange={setCommitmentMessage}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Duration in days</span>
                </label>
                <div className={`flex border-2 border-base-300 bg-base-200 rounded-full text-accent`}>
                  <input
                    className="input input-ghost focus-within:border-transparent focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/50 text-gray-400"
                    placeholder="Enter Duration in days"
                    type="number"
                    onChange={e => setDuration(e.target.value)}
                    value={duration}
                  />
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Proof frequency in days</span>
                </label>
                <div className={`flex border-2 border-base-300 bg-base-200 rounded-full text-accent`}>
                  <input
                    className="input input-ghost focus-within:border-transparent focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/50 text-gray-400"
                    placeholder="Proof Frequency in days, eg: 1 if you plan to uplaod proof everyday"
                    type="number"
                    onChange={e => setProofFrequency(e.target.value)}
                    value={proofFrequency}
                  />
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Is group commitment</span>
                </label>
                <input
                  className="checkbox rounded-md"
                  type="checkbox"
                  onChange={() => setIsGroupCommitment(prev => !prev)}
                  checked={isGroupCommitment}
                />
              </div>

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
