import { expect } from "chai";
import { ethers } from "hardhat";
import { CommitmentContract } from "../typechain-types";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("CommitmentContract", function () {
  let commitmentContract: CommitmentContract;
  let owner: SignerWithAddress;
  let participant1: SignerWithAddress;
  let participant2: SignerWithAddress;
  let nonParticipant: SignerWithAddress;

  const oneEther = ethers.parseEther("1");
  const twoWeeks = 14 * 24 * 60 * 60; // 14 days in seconds

  beforeEach(async function () {
    [owner, participant1, participant2, nonParticipant] = await ethers.getSigners();

    const CommitmentContract = await ethers.getContractFactory("CommitmentContract");
    commitmentContract = await CommitmentContract.deploy();
  });

  describe("createCommitment", function () {
    it("should create a commitment successfully", async function () {
      const endDate = (await time.latest()) + twoWeeks;
      await expect(
        commitmentContract.connect(owner).createCommitment(
          "Test Commitment",
          oneEther,
          endDate,
          86400, // 1 day proof frequency
          true, // group commitment
          { value: oneEther },
        ),
      )
        .to.emit(commitmentContract, "CommitmentCreated")
        .withArgs(0, owner.address, "Test Commitment", oneEther, endDate, 86400, true);
    });

    it("should revert if stake amount doesn't match sent value", async function () {
      const endDate = (await time.latest()) + twoWeeks;
      await expect(
        commitmentContract.connect(owner).createCommitment("Test Commitment", oneEther, endDate, 86400, true, {
          value: ethers.parseEther("0.5"),
        }),
      ).to.be.revertedWith("Stake amount must match the sent value");
    });

    it("should revert if end date is in the past", async function () {
      const pastDate = (await time.latest()) - 1;
      await expect(
        commitmentContract
          .connect(owner)
          .createCommitment("Test Commitment", oneEther, pastDate, 86400, true, { value: oneEther }),
      ).to.be.revertedWith("End date must be in the future");
    });
  });

  describe("joinCommitment", function () {
    beforeEach(async function () {
      const endDate = (await time.latest()) + twoWeeks;
      await commitmentContract
        .connect(owner)
        .createCommitment("Test Commitment", oneEther, endDate, 86400, true, { value: oneEther });
    });

    it("should allow a participant to join a group commitment", async function () {
      await expect(commitmentContract.connect(participant1).joinCommitment(0, { value: oneEther }))
        .to.emit(commitmentContract, "ParticipantJoined")
        .withArgs(0, participant1.address);
    });

    it("should revert if trying to join a non-group commitment", async function () {
      const endDate = (await time.latest()) + twoWeeks;
      await commitmentContract
        .connect(owner)
        .createCommitment("Individual Commitment", oneEther, endDate, 86400, false, { value: oneEther });

      await expect(commitmentContract.connect(participant1).joinCommitment(1, { value: oneEther })).to.be.revertedWith(
        "This is not a group commitment",
      );
    });

    it("should revert if commitment period has ended", async function () {
      await time.increase(twoWeeks + 1);
      await expect(commitmentContract.connect(participant1).joinCommitment(0, { value: oneEther })).to.be.revertedWith(
        "Commitment period has ended",
      );
    });

    it("should revert if incorrect stake amount is sent", async function () {
      await expect(
        commitmentContract.connect(participant1).joinCommitment(0, { value: ethers.parseEther("0.5") }),
      ).to.be.revertedWith("Incorrect stake amount");
    });

    it("should revert if participant tries to join twice", async function () {
      await commitmentContract.connect(participant1).joinCommitment(0, { value: oneEther });
      await expect(commitmentContract.connect(participant1).joinCommitment(0, { value: oneEther })).to.be.revertedWith(
        "You have already joined this commitment",
      );
    });
  });

  describe("completeCommitment", function () {
    beforeEach(async function () {
      const endDate = (await time.latest()) + twoWeeks;
      await commitmentContract
        .connect(owner)
        .createCommitment("Test Commitment", oneEther, endDate, 86400, true, { value: oneEther });
      await commitmentContract.connect(participant1).joinCommitment(0, { value: oneEther });
      await commitmentContract.connect(participant2).joinCommitment(0, { value: oneEther });
    });

    it("should complete the commitment and distribute rewards", async function () {
      await time.increase(twoWeeks + 1);
      const completedParticipants = [owner.address, participant1.address];

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      const participant1BalanceBefore = await ethers.provider.getBalance(participant1.address);
      const participant2BalanceBefore = await ethers.provider.getBalance(participant2.address);

      const tx = await commitmentContract.connect(owner).completeCommitment(0, completedParticipants);

      await expect(tx)
        .to.emit(commitmentContract, "CommitmentCompleted")
        .withArgs(0, completedParticipants, ethers.parseEther("1.5"));

      // Check balances
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      const participant1BalanceAfter = await ethers.provider.getBalance(participant1.address);
      const participant2BalanceAfter = await ethers.provider.getBalance(participant2.address);

      // Owner should receive rewards, but also pay gas, so balance should be greater
      expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore);

      // Participant1 should receive rewards, so balance should be greater
      expect(participant1BalanceAfter).to.be.gt(participant1BalanceBefore);

      // Participant2 should not receive any ETH, so balance should be equal
      expect(participant2BalanceAfter).to.equal(participant2BalanceBefore);
    });

    it("should revert if non-creator tries to complete the commitment", async function () {
      await time.increase(twoWeeks + 1);
      await expect(
        commitmentContract.connect(participant1).completeCommitment(0, [owner.address, participant1.address]),
      ).to.be.revertedWith("Only the creator can complete the commitment");
    });

    it("should revert if commitment period has not ended", async function () {
      await expect(
        commitmentContract.connect(owner).completeCommitment(0, [owner.address, participant1.address]),
      ).to.be.revertedWith("Commitment period has not ended yet");
    });

    it("should revert if commitment is already completed", async function () {
      await time.increase(twoWeeks + 1);
      await commitmentContract.connect(owner).completeCommitment(0, [owner.address, participant1.address]);
      await expect(
        commitmentContract.connect(owner).completeCommitment(0, [owner.address, participant1.address]),
      ).to.be.revertedWith("Commitment is already completed");
    });

    it("should revert if an invalid participant is included", async function () {
      await time.increase(twoWeeks + 1);
      await expect(
        commitmentContract.connect(owner).completeCommitment(0, [owner.address, nonParticipant.address]),
      ).to.be.revertedWith("Invalid participant");
    });

    it("should emit DustSentToCreator event when there's potential for dust", async function () {
      const endDate = (await time.latest()) + twoWeeks;
      const oddAmount = oneEther + 1n;

      await commitmentContract
        .connect(owner)
        .createCommitment("Dust Test", oddAmount, endDate, 86400, true, { value: oddAmount });
      await commitmentContract.connect(participant1).joinCommitment(1, { value: oddAmount });
      await commitmentContract.connect(participant2).joinCommitment(1, { value: oddAmount });

      await time.increase(twoWeeks + 1);

      const tx = await commitmentContract.connect(owner).completeCommitment(1, [owner.address, participant1.address]);

      await expect(tx).to.emit(commitmentContract, "DustSentToCreator");
      await expect(tx).to.emit(commitmentContract, "CommitmentCompleted");
    });
  });

  describe("getParticipants", function () {
    it("should return all participants of a commitment", async function () {
      const endDate = (await time.latest()) + twoWeeks;
      await commitmentContract
        .connect(owner)
        .createCommitment("Test Commitment", oneEther, endDate, 86400, true, { value: oneEther });
      await commitmentContract.connect(participant1).joinCommitment(0, { value: oneEther });
      await commitmentContract.connect(participant2).joinCommitment(0, { value: oneEther });

      const participants = await commitmentContract.getParticipants(0);
      expect(participants).to.deep.equal([owner.address, participant1.address, participant2.address]);
    });
  });
});
