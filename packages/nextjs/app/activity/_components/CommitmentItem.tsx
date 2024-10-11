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
      await writeCommitmentContractAsync({
        functionName: "joinCommitment",
        args: [BigInt(commitment.id)],
        value: BigInt(commitment.stakeAmount),
      });
      await apolloClient.refetchQueries({
        include: "active",
      });
      notification.success("You're in! 🎉 Commitment joined successfully!");
    } catch (e) {
      notification.error("Oops! Something went wrong. 😕");
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
  const summaryText = `${commitment.description}, ${frequencyText} until ${endDate}`;

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out">
      <div className="card-body">
        <h2 className="card-title text-2xl text-primary mb-2">{summaryText}</h2>
        <div className="badge badge-primary p-2">
          {commitment.isGroupCommitment ? "Group Challenge 🎉" : "Solo Mission 💪"}
        </div>
        <div className="m-0 flex-col space-y-1 mb-2">
          <strong>Creator:</strong>
          <Address address={commitment.creator} />
        </div>
        <p className="m-0">
          <strong>End Date:</strong> {endDate}
        </p>
        <p className="m-0">
          <strong>Participants:</strong> {commitment.participants.items.length} 🚀
        </p>
        <p className="m-0">
          <strong>Stake Amount:</strong> {parseFloat(commitment.stakeAmount) / 1e18} ETH 💰
        </p>
        <p className="m-0">
          <strong>Frequency:</strong> Every {commitment.proofFrequency} day(s)
        </p>
        <div className="card-actions justify-end mt-4">
          <button className="btn btn-accent btn-outline" onClick={handleJoinCommitment}>
            Jump In! 🚀
          </button>
          <Link href={`/commitment/${commitment.id}`}>
            <button className="btn btn-primary">See Details 📋</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CommitmentItem;
