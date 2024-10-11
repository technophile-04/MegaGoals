"use client";

import React from "react";
import CommitmentItem from "./_components/CommitmentItem";
import { useCommitments } from "~~/hooks/useCommitments";

const Commitments = () => {
  const {
    loading,
    error,
    data: activeCommitment,
  } = useCommitments({
    filter: {
      isCompleted: false,
    },
  });

  const {
    loading: isCompletedLoading,
    error: isCompletedError,
    data: completedCommitment,
  } = useCommitments({
    filter: {
      isCompleted: true,
    },
  });

  if (loading || isCompletedLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  if (error || isCompletedError)
    return (
      <div className="alert alert-error shadow-lg">
        <div>
          <span>Error loading commitments.</span>
        </div>
      </div>
    );

  return (
    <div className="space-y-2">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Active Commitments</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCommitment?.commitments.items.map(commitment => (
            <CommitmentItem key={commitment.id} commitment={commitment} />
          ))}
        </div>
        {activeCommitment?.commitments.items.length === 0 && (
          <div className="text-center mt-10">
            <p className="text-xl">No active commitments found.</p>
          </div>
        )}
      </div>

      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Completed Commitments</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedCommitment?.commitments.items.map(commitment => (
            <CommitmentItem key={commitment.id} commitment={commitment} />
          ))}
        </div>
        {completedCommitment?.commitments.items.length === 0 && (
          <div className="text-center mt-10">
            <p className="text-xl">No active commitments found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Commitments;
