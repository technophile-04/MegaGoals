"use client";

import React from "react";
import { Address } from "~~/components/scaffold-eth";
import { useCommitmentDetails } from "~~/hooks/useCommitmentDetails";

interface CommitmentDetailsProps {
  id: string;
}

const CommitmentDetails: React.FC<CommitmentDetailsProps> = ({ id }) => {
  const { loading, error, data } = useCommitmentDetails(id);

  if (loading) return <div className="loading loading-spinner loading-lg"></div>;
  if (error) return <div className="alert alert-error">Error loading commitment details</div>;
  if (!data?.commitment) return <div className="alert alert-warning">Commitment not found</div>;

  const { commitment } = data;

  const getFrequencyText = (frequency: string) => {
    const freq = parseInt(frequency);
    if (freq === 1) return "daily";
    if (freq === 7) return "weekly";
    if (freq === 30) return "monthly";
    return `every ${freq} days`;
  };

  const endDate = new Date(parseInt(commitment.endDate) * 1000).toLocaleDateString();
  const frequencyText = getFrequencyText(commitment.proofFrequency);
  const summaryText = `${commitment.description}, ${frequencyText} till ${endDate}`;

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
      </div>
    </div>
  );
};

export default CommitmentDetails;
