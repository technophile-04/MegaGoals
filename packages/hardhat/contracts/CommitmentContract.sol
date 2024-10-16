// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CommitmentContract {
	struct Commitment {
		address creator;
		string description;
		uint256 stakeAmount;
		uint256 endDate;
		bool isGroupCommitment;
		uint256 proofFrequency;
		bool isCompleted;
		address[] participants;
		mapping(address => bool) hasParticipated;
	}

	mapping(uint256 => Commitment) public commitments;
	uint256 public commitmentCounter;

	event CommitmentCreated(
		uint256 indexed commitmentId,
		address creator,
		string description,
		uint256 stakeAmount,
		uint256 endDate,
		uint256 proofFrequency,
		bool isGroupCommitment
	);
	event ParticipantJoined(uint256 indexed commitmentId, address participant);
	event CommitmentCompleted(
		uint256 indexed commitmentId,
		address[] completedParticipants,
		uint256 rewardPerParticipant
	);
	event DustSentToCreator(uint256 indexed commitmentId, uint256 dustAmount);

	function createCommitment(
		string memory _description,
		uint256 _stakeAmount,
		uint256 _endDate,
		uint256 proofFrequency,
		bool _isGroupCommitment
	) public payable {
		require(
			msg.value == _stakeAmount,
			"Stake amount must match the sent value"
		);
		require(_endDate > block.timestamp, "End date must be in the future");
		require(_stakeAmount > 0, "Stake amount must be greater than zero");
		require(
			proofFrequency > 0,
			"Proof frequency must be greater than zero"
		);

		uint256 commitmentId = commitmentCounter++;
		Commitment storage newCommitment = commitments[commitmentId];
		newCommitment.creator = msg.sender;
		newCommitment.description = _description;
		newCommitment.stakeAmount = _stakeAmount;
		newCommitment.endDate = _endDate;
		newCommitment.isGroupCommitment = _isGroupCommitment;
		newCommitment.isCompleted = false;
		newCommitment.participants.push(msg.sender);
		newCommitment.hasParticipated[msg.sender] = true;
		newCommitment.proofFrequency = proofFrequency;

		emit CommitmentCreated(
			commitmentId,
			msg.sender,
			_description,
			_stakeAmount,
			newCommitment.endDate,
			proofFrequency,
			_isGroupCommitment
		);
	}

	function joinCommitment(uint256 _commitmentId) public payable {
		Commitment storage commitment = commitments[_commitmentId];
		require(commitment.isGroupCommitment, "This is not a group commitment");
		require(!commitment.isCompleted, "Commitment is already completed");
		require(
			block.timestamp < commitment.endDate,
			"Commitment period has ended"
		);
		require(msg.value == commitment.stakeAmount, "Incorrect stake amount");
		require(
			!commitment.hasParticipated[msg.sender],
			"You have already joined this commitment"
		);

		commitment.participants.push(msg.sender);
		commitment.hasParticipated[msg.sender] = true;

		emit ParticipantJoined(_commitmentId, msg.sender);
	}

	function completeCommitment(
		uint256 _commitmentId,
		address[] memory _completedParticipants
	) public {
		Commitment storage commitment = commitments[_commitmentId];
		require(
			msg.sender == commitment.creator,
			"Only the creator can complete the commitment"
		);
		require(!commitment.isCompleted, "Commitment is already completed");
		require(
			block.timestamp >= commitment.endDate,
			"Commitment period has not ended yet"
		);

		uint256 totalReward = commitment.stakeAmount *
			commitment.participants.length;
		uint256 rewardPerParticipant = totalReward /
			_completedParticipants.length;
		uint256 totalDistributed = rewardPerParticipant *
			_completedParticipants.length;
		uint256 dustAmount = totalReward - totalDistributed;

		for (uint256 i = 0; i < _completedParticipants.length; i++) {
			require(
				commitment.hasParticipated[_completedParticipants[i]],
				"Invalid participant"
			);
			(bool success, ) = _completedParticipants[i].call{
				value: rewardPerParticipant
			}("");
			require(success, "Payment failed");
		}

		if (dustAmount > 0) {
			(bool success, ) = commitment.creator.call{ value: dustAmount }("");
			require(success, "Dust payment failed");
			emit DustSentToCreator(_commitmentId, dustAmount);
		}

		commitment.isCompleted = true;
		emit CommitmentCompleted(
			_commitmentId,
			_completedParticipants,
			rewardPerParticipant
		);
	}

	function getParticipants(
		uint256 _commitmentId
	) public view returns (address[] memory) {
		return commitments[_commitmentId].participants;
	}
}
