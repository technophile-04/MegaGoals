"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useCommitmentDetails } from "~~/hooks/useCommitmentDetails";
import { useGlobalState } from "~~/services/store/store";

interface CommitmentDetailsProps {
  id: string;
}

const CommitmentDetails: React.FC<CommitmentDetailsProps> = ({ id }) => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);

  const { loading, error, data } = useCommitmentDetails(id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedParticipants, setCompletedParticipants] = useState<string[]>([]);
  const [availableParticipants, setAvailableParticipants] = useState<string[]>([]);
  const { address: connectedAccount } = useAccount();

  const { writeContractAsync: writeCommitmentContractAsync, isMining: isSendingTransaction } =
    useScaffoldWriteContract("CommitmentContract");

  useEffect(() => {
    if (data?.commitment) {
      const allParticipants = data.commitment.participants.items.map(item => item.participant);
      setAvailableParticipants(allParticipants);
    }
  }, [data]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleRemoveParticipant = (address: string) => {
    setCompletedParticipants(prev => prev.filter(p => p !== address));
    setAvailableParticipants(prev => [...prev, address]);
  };

  const handleAddParticipant = () => {
    if (availableParticipants.length > 0) {
      const [nextParticipant, ...rest] = availableParticipants;
      setCompletedParticipants(prev => [...prev, nextParticipant]);
      setAvailableParticipants(rest);
    }
  };

  const handleCompleteCommitment = async () => {
    try {
      await writeCommitmentContractAsync({
        functionName: "completeCommitment",
        args: [BigInt(id), completedParticipants],
      });
      handleCloseModal();
    } catch (e) {
      console.error("Error completing commitment:", e);
    }
  };

  const handleJoinCommitment = async () => {
    try {
      await writeCommitmentContractAsync({
        functionName: "joinCommitment",
        args: [BigInt(id)],
        value: BigInt(commitment.stakeAmount),
      });
    } catch (e) {
      console.error("Error joining commitment:", e);
    }
  };

  const handleOpenModal = () => {
    if (data?.commitment) {
      const allParticipants = data.commitment.participants.items.map(item => item.participant);
      setCompletedParticipants(allParticipants);
      setAvailableParticipants([]);
    }
    setIsModalOpen(true);
  };

  const getFrequencyText = (frequency: string) => {
    const freq = parseInt(frequency);
    if (freq === 1) return "daily";
    if (freq === 7) return "weekly";
    if (freq === 30) return "monthly";
    return `every ${freq} days`;
  };

  if (loading) return <div className="loading loading-spinner loading-lg"></div>;
  if (error) return <div className="alert alert-error">Error loading commitment details</div>;
  if (!data?.commitment) return <div className="alert alert-warning">Commitment not found</div>;

  const { commitment } = data;
  const endDate = new Date(parseInt(commitment.endDate) * 1000).toLocaleDateString();
  const frequencyText = getFrequencyText(commitment.proofFrequency);
  const summaryText = `${commitment.description}, ${frequencyText} till ${endDate}`;

  const shouldDisplayCompleteCommitmentButton =
    connectedAccount?.toLowerCase() === commitment.creator.toLowerCase() && !commitment.isCompleted;
  const disableCompleteCommitmentButton = parseInt(commitment.endDate) * 1000 > Date.now();

  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300 ease-in-out">
      <div className="card-body">
        <h2 className="card-title text-3xl text-accent mb-2">{summaryText}</h2>
        <div className="badge badge-primary mb-2">
          {commitment.isGroupCommitment ? "Group Challenge 🎉" : "Solo Mission 💪"}
        </div>
        <p className="m-0">
          <strong>Creator:</strong> <Address address={commitment.creator} />
        </p>
        <p className="m-0">
          <strong>End Date:</strong> {new Date(parseInt(commitment.endDate) * 1000).toLocaleString()}
        </p>
        <p className="m-0">
          <strong>Joining amount:</strong>
          {(parseFloat(commitment.stakeAmount) / 1e18).toFixed(4)} ETH / $
          {(nativeCurrencyPrice * (parseFloat(commitment.stakeAmount) / 1e18)).toFixed(2)} appx.
        </p>
        <p className="m-0">
          <strong>Frequency:</strong> Every {commitment.proofFrequency} day(s)
        </p>
        <p className="m-0">
          <strong>Total stake:</strong>{" "}
          {commitment?.totalStake
            ? `
          ${(parseFloat(commitment.totalStake) / 1e18).toFixed(4)} ETH / $
          ${(nativeCurrencyPrice * (parseFloat(commitment.totalStake) / 1e18)).toFixed(2)} appx.

`
            : 0}{" "}
          ETH
        </p>

        <div className="mt-4">
          <h3 className="font-bold">Participants:</h3>
          <ul className="space-y-3">
            {commitment.participants.items.map((item, index) => (
              <li key={index}>
                <Address address={item.participant} />
              </li>
            ))}
          </ul>
        </div>

        {commitment.completedParticipants && commitment.completedParticipants.length > 0 && (
          <div className="mt-4">
            <h3 className="font-bold">Completed Participants:</h3>
            <ul className="space-y-3">
              {commitment.completedParticipants.map((participant, index) => (
                <li key={index}>
                  <Address address={participant} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {shouldDisplayCompleteCommitmentButton && (
          <button
            className="btn btn-accent mt-4"
            disabled={disableCompleteCommitmentButton || isSendingTransaction}
            onClick={handleOpenModal}
          >
            Complete Commitment! 🚀
          </button>
        )}
        {commitment.isCompleted && <h2 className="text-2xl text-center">Mission Accomplished! 🎉</h2>}
        {!shouldDisplayCompleteCommitmentButton && !commitment.isCompleted && (
          <button className="btn btn-primary mt-4" disabled={isSendingTransaction} onClick={handleJoinCommitment}>
            Join the Journey 🚀
          </button>
        )}
      </div>

      {/* Modal */}
      <dialog id="complete_modal" className={`modal ${isModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Complete Commitment</h3>
          <p className="py-4">Select the participants who made it to the end:</p>
          <div className="space-y-4">
            {completedParticipants.map((address, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Address address={address} />
                <button onClick={() => handleRemoveParticipant(address)} className="btn btn-circle btn-sm btn-error">
                  <MinusIcon className="size-[20px]" />
                </button>
              </div>
            ))}
            <button
              onClick={handleAddParticipant}
              className="btn btn-circle btn-sm btn-primary"
              disabled={availableParticipants.length === 0}
            >
              <PlusIcon className="size-[20px]" />
            </button>
          </div>
          <div className="modal-action">
            <button className="btn btn-accent" disabled={isSendingTransaction} onClick={handleCompleteCommitment}>
              Complete
            </button>
            <button className="btn" onClick={handleCloseModal}>
              Close
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default CommitmentDetails;
