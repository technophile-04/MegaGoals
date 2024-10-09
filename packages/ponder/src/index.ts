import { ponder } from "@/generated";

ponder.on(
  "CommitmentContract:CommitmentCreated",
  async ({ event, context }) => {
    const { Commitment, Participant } = context.db;

    await Commitment.create({
      id: event.args.commitmentId,
      data: {
        creator: event.args.creator,
        description: event.args.description,
        stakeAmount: event.args.stakeAmount,
        endDate: event.args.endDate,
        isGroupCommitment: event.args.isGroupCommitment,
        isCompleted: false,
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
  },
);

ponder.on(
  "CommitmentContract:ParticipantJoined",
  async ({ event, context }) => {
    const { Participant } = context.db;

    // Use upsert to handle potential edge cases (like if the event is processed twice)
    await Participant.upsert({
      id: `${event.args.commitmentId}-${event.args.participant}`,
      create: {
        commitmentId: event.args.commitmentId,
        participant: event.args.participant,
      },
      update: {}, // No update needed if it already exists
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
      },
    });
  },
);
