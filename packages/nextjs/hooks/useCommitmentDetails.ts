import { gql, useQuery } from "@apollo/client";

const COMMITMENT_DETAILS_QUERY = gql`
  query GetCommitmentDetails($id: BigInt!) {
    commitment(id: $id) {
      id
      creator
      description
      stakeAmount
      endDate
      isGroupCommitment
      proofFrequency
      totalStake
      completedParticipants
      participants {
        items {
          id
          participant
        }
      }
    }
  }
`;

export type Participant = {
  id: string;
  participant: string;
};

export type Commitment = {
  id: string;
  creator: string;
  description: string;
  stakeAmount: string;
  endDate: string;
  isGroupCommitment: boolean;
  proofFrequency: string;
  completedParticipants: string[] | null;
  participants: {
    items: Participant[];
  };
  totalStake: string;
};

export type CommitmentDetailsData = {
  commitment: Commitment;
};

export type CommitmentDetailsVariables = {
  id: string;
};

export const useCommitmentDetails = (id: string) => {
  return useQuery<CommitmentDetailsData, CommitmentDetailsVariables>(COMMITMENT_DETAILS_QUERY, {
    variables: { id },
    skip: !id,
  });
};
