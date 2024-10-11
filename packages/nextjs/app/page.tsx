"use client";

import React, { useState } from "react";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { EtherInput, InputBase } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const Home: NextPage = () => {
  const [stakeAmount, setStakeAmount] = useState("");
  const [commitmentMessage, setCommitmentMessage] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [proofFrequency, setProofFrequency] = useState("daily");
  const [isGroupCommitment, setIsGroupCommitment] = useState(true);
  const { writeContractAsync: writeGroupCommitmentContractAsync } = useScaffoldWriteContract("CommitmentContract");

  const handleCreateGroupCommitment = async () => {
    try {
      if (!endDateTime || !stakeAmount || !commitmentMessage) {
        return notification.error("Please fill all the fields");
      }

      const endDate = new Date(endDateTime).getTime() / 1000;

      const frequencyInDays = {
        daily: 1,
        weekly: 7,
        monthly: 30,
      }[proofFrequency];

      if (!frequencyInDays) {
        return notification.error("Invalid frequency");
      }

      await writeGroupCommitmentContractAsync({
        functionName: "createCommitment",
        args: [commitmentMessage, parseEther(stakeAmount), BigInt(endDate), BigInt(frequencyInDays), isGroupCommitment],
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
          <span className="block text-4xl font-bold">MegaGoals</span>
        </h1>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Commitment Message</span>
                </label>
                <InputBase placeholder="Go to gym" value={commitmentMessage} onChange={setCommitmentMessage} />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">End date and time</span>
                </label>
                <div className={`flex border-2 border-base-300 bg-base-200 rounded-full text-accent`}>
                  <input
                    className="input input-ghost focus-within:border-transparent focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/50 text-gray-400"
                    placeholder="Enter end date and time"
                    type="datetime-local"
                    onChange={e => setEndDateTime(e.target.value)}
                    value={endDateTime}
                  />
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Frequency</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={proofFrequency}
                  onChange={e => setProofFrequency(e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label className="label">
                  <span className="label-text">Allow MegaZu community to join?</span>
                </label>
                <input
                  className="checkbox rounded-md checkbox-sm"
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
