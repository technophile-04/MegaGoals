"use client";

import React from "react";
import CommitmentItem from "./_components/CommitmentItem";
import { useCommitments } from "~~/hooks/useCommitments";

const Commitments = () => {
  const { loading, error, data } = useCommitments({
    filter: {
      isCompleted: false,
    },
  });

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  if (error)
    return (
      <div className="alert alert-error shadow-lg">
        <div>
          <span>Error loading commitments.</span>
        </div>
      </div>
    );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Active Commitments</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.commitments.items.map(commitment => (
          <CommitmentItem key={commitment.id} commitment={commitment} />
        ))}
      </div>
      {data?.commitments.items.length === 0 && (
        <div className="text-center mt-10">
          <p className="text-xl">No active commitments found.</p>
        </div>
      )}
    </div>
  );
};

export default Commitments;
