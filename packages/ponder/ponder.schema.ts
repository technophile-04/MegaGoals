import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
  Commitment: p.createTable(
    {
      id: p.bigint(), // commitmentId
      creator: p.string(), // address
      description: p.string(),
      stakeAmount: p.bigint(),
      totalStake: p.bigint(),
      endDate: p.bigint(),
      rewardPerParticipant: p.bigint().optional(),
      isGroupCommitment: p.boolean(),
      isCompleted: p.boolean(),
      completedParticipants: p.string().list().optional(), // array of addresses
      proofFrequency: p.bigint(),
      participants: p.many("Participant.commitmentId"),
    },
    {
      creatorIndex: p.index("creator"),
    },
  ),

  Participant: p.createTable(
    {
      id: p.string(), // Composite key: commitmentId + participant address
      commitmentId: p.bigint().references("Commitment.id"),
      participant: p.string(), // address
      commitment: p.one("commitmentId"),
    },
    {
      commitmentParticipantIndex: p.index(["commitmentId", "participant"]),
    },
  ),
}));
