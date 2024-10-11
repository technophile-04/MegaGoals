import { QueryHookOptions, QueryResult, gql, useQuery } from "@apollo/client";

export type Participant = {
  participant: string;
};

export type Commitment = {
  id: string;
  creator: string;
  description: string;
  endDate: string;
  isCompleted: boolean;
  isGroupCommitment: boolean;
  proofFrequency: string;
  stakeAmount: string;
  completedParticipants: string[] | null;
  participants: {
    items: Participant[];
  };
  totalStake?: string;
};

export type CommitmentItems = Commitment[];

export type CommitmentsData = {
  commitments: {
    items: CommitmentItems;
  };
};

export const COMMITMENTS_QUERY = gql`
  query GetCommitments($filter: CommitmentFilter, $orderBy: String, $orderDirection: String) {
    commitments(where: $filter, orderBy: $orderBy, orderDirection: $orderDirection) {
      items {
        id
        creator
        description
        endDate
        isCompleted
        isGroupCommitment
        proofFrequency
        totalStake
        stakeAmount
        completedParticipants
        participants {
          items {
            participant
          }
        }
      }
    }
  }
`;

type CommitmentFilter = {
  creator?: string;
  isCompleted?: boolean;
  isGroupCommitment?: boolean;
  // Add other possible filter fields here
};

type UseCommitmentsParams = {
  filter?: CommitmentFilter;
  skip?: boolean;
} & Omit<
  QueryHookOptions<CommitmentsData, { filter: CommitmentFilter; orderBy?: string; orderDirection?: string }>,
  "variables" | "skip"
>;

export const useCommitments = ({
  filter = {},
  skip: customSkip,
  ...options
}: UseCommitmentsParams): QueryResult<
  CommitmentsData,
  { filter: CommitmentFilter; orderBy?: string; orderDirection?: string }
> => {
  return useQuery<CommitmentsData, { filter: CommitmentFilter; orderBy?: string; orderDirection?: string }>(
    COMMITMENTS_QUERY,
    {
      variables: {
        filter,
        orderBy: "id", // You can change this default ordering if needed
        orderDirection: "desc",
      },
      skip: customSkip || Object.values(filter).every(val => val === undefined),
      ...options,
    },
  );
};
