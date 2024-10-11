import { ponder } from "@/generated";

export const replacer = (_key: string, value: unknown) =>
  typeof value === "bigint" ? value.toString() : value;

// I have a secret at .env.local and then I need to make a POSt request to make my NEXT backend the api is `http://localhost:300/api/create-commitment` and the body is `{"description":"test","stakeAmount":"100","endDate":"2022-12-12","isGroupCommitment":false}`

ponder.on(
  "CommitmentContract:CommitmentCreated",
  async ({ event, context }) => {
    const { Commitment, Participant } = context.db;

    // Create commitment in Ponder
    await Commitment.create({
      id: event.args.commitmentId,
      data: {
        creator: event.args.creator,
        description: event.args.description,
        stakeAmount: event.args.stakeAmount,
        endDate: event.args.endDate,
        proofFrequency: event.args.proofFrequency,
        isGroupCommitment: event.args.isGroupCommitment,
        isCompleted: false,
        totalStake: event.args.stakeAmount,
      },
    });

    // Add creator as the first participant
    await Participant.create({
      id: `${event.args.commitmentId}-${event.args.creator}`,
      data: {
        commitmentId: event.args.commitmentId,
        participant: event.args.creator,
      },
    });

    // Ensure user exists in off-chain database
    await fetch("http://localhost:3000/api/ensure-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SECRET}`,
      },
      body: JSON.stringify({ address: event.args.creator }, replacer),
    });
  },
);

ponder.on(
  "CommitmentContract:ParticipantJoined",
  async ({ event, context }) => {
    const { Participant, Commitment } = context.db;

    // Use upsert to handle potential edge cases (like if the event is processed twice)
    await Participant.upsert({
      id: `${event.args.commitmentId}-${event.args.participant}`,
      create: {
        commitmentId: event.args.commitmentId,
        participant: event.args.participant,
      },
      update: {}, // No update needed if it already exists
    });

    //  upadte totalStake in Commitment table
    await Commitment.update({
      id: event.args.commitmentId,
      data: ({ current }) => {
        console.log(current.totalStake);
        console.log(current.stakeAmount);
        return {
          totalStake: current.totalStake + current.stakeAmount,
        };
      },
    });
  },
);

ponder.on(
  "CommitmentContract:CommitmentCompleted",
  async ({ event, context }) => {
    const { Commitment } = context.db;

    await Commitment.update({
      id: event.args.commitmentId,
      data: {
        isCompleted: true,
        // @ts-expect-error
        completedParticipants: event.args.completedParticipants,
        rewardPerParticipant: event.args.rewardPerParticipant,
      },
    });
  },
);
