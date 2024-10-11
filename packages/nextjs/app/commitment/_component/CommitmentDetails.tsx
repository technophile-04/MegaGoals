"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useCommitmentDetails } from "~~/hooks/useCommitmentDetails";

interface CommitmentDetailsProps {
  id: string;
}

const CommitmentDetails: React.FC<CommitmentDetailsProps> = ({ id }) => {
  const { loading, error, data } = useCommitmentDetails(id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedParticipants, setCompletedParticipants] = useState<string[]>([]);
  const [availableParticipants, setAvailableParticipants] = useState<string[]>([]);
  const { address: connectedAccount } = useAccount();

  const { writeContractAsync: writeCommitmentContractAsync } = useScaffoldWriteContract("CommitmentContract");

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
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{summaryText}</h2>
        <div className="badge badge-primary mb-1">{commitment.isGroupCommitment ? "Group" : "Individual"}</div>
        <p className="my-0">
          <strong>Creator:</strong> <Address address={commitment.creator} />
        </p>
        <p className="my-0">
          <strong>End Date:</strong> {new Date(parseInt(commitment.endDate) * 1000).toLocaleString()}
        </p>
        <p className="my-0">
          <strong>Joining amount:</strong> {parseFloat(commitment.stakeAmount) / 1e18} ETH
        </p>
        <p className="my-0">
          <strong>Proof Frequency:</strong> Every {commitment.proofFrequency} day(s)
        </p>
        <p className="my-0">
          <strong>Total stake:</strong> {commitment?.totalStake ? parseFloat(commitment.totalStake) / 1e18 : 0} ETH{" "}
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
          <button className="btn btn-primary mt-4" disabled={disableCompleteCommitmentButton} onClick={handleOpenModal}>
            Complete Commitment
          </button>
        )}
        {commitment.isCompleted && <h2 className="text-2xl text-center">Completed 🎉</h2>}
      </div>

      {/* Modal */}
      <dialog id="complete_modal" className={`modal ${isModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Complete Commitment</h3>
          <p className="py-4">Select the participants who completed the commitment:</p>
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
            <button className="btn btn-primary" onClick={handleCompleteCommitment}>
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
