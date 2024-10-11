import React from "react";
import Link from "next/link";
import { apolloClient } from "~~/components/ScaffoldEthAppWithProviders";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { Commitment } from "~~/hooks/useCommitments";
import { notification } from "~~/utils/scaffold-eth";

interface CommitmentItemProps {
  commitment: Commitment;
}

const CommitmentItem: React.FC<CommitmentItemProps> = ({ commitment }) => {
  const { writeContractAsync: writeCommitmentContractAsync } = useScaffoldWriteContract("CommitmentContract");

  const handleJoinCommitment = async () => {
    try {
      console.log("Joining commitment:", commitment);
      await writeCommitmentContractAsync({
        functionName: "joinCommitment",
        args: [BigInt(commitment.id)],
        value: BigInt(commitment.stakeAmount),
      });
      await apolloClient.refetchQueries({
        include: "active",
      });
      notification.success("Successfully joined the commitment!");
    } catch (e) {
      console.error("Error joining commitment:", e);
    }
  };

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
        <div className="badge badge-primary">{commitment.isGroupCommitment ? "Group" : "Individual"}</div>
        <div className="m-0 flex-col space-y-1 mb-2">
          <strong>Creator:</strong>
          <Address address={commitment.creator} />
        </div>
        <p className="m-0">
          <strong>End Date:</strong> {new Date(parseInt(commitment.endDate) * 1000).toLocaleDateString()}
        </p>
        <p className="m-0">
          <strong>Participants:</strong> {commitment.participants.items.length}
        </p>
        <p className="m-0">
          <strong>Stake Amount:</strong> {parseFloat(commitment.stakeAmount) / 1e18} ETH
        </p>
        <p className="m-0">
          <strong>Proof Frequency:</strong> Every {commitment.proofFrequency} day(s)
        </p>
        <div className="card-actions justify-end mt-4">
          <button className="btn btn-secondary" onClick={handleJoinCommitment}>
            Join Commitment
          </button>
          <Link href={`/commitment/${commitment.id}`}>
            <button className="btn btn-primary">View Details</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CommitmentItem;
