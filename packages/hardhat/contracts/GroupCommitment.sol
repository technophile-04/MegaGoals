// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GroupCommitment {
	struct Participant {
		address addr;
		string proof;
		uint256 voteCount;
	}

	struct Commitment {
		Participant[] participants;
		uint256 totalStake;
		mapping(address => bool) hasVoted;
		bool isActive;
		bool isCompleted;
		uint256 creationTime;
		bool allProofsSubmitted;
		string message;
	}

	Commitment[] public commitments;

	uint256 public constant COMMITMENT_DURATION = 1 days;

	// Events
	event CommitmentCreated(
		uint256 indexed commitmentId,
		address[] participants,
		uint256 totalStake,
		uint256 creationTime,
		string message // Added message to the event
	);
	event ProofSubmitted(
		uint256 indexed commitmentId,
		address indexed participant,
		string proof
	);
	event AllProofsSubmitted(uint256 indexed commitmentId);
	event VoteCast(
		uint256 indexed commitmentId,
		address indexed voter,
		address[] votedFor
	);
	event CommitmentCompleted(
		uint256 indexed commitmentId,
		address[] winners,
		uint256 reward
	);

	function createCommitment(
		address[] memory _participants,
		string memory _message
	) external payable {
		require(_participants.length >= 1, "Need at least 2 participants");
		require(msg.value > 0, "Stake must be greater than 0");
		require(
			bytes(_message).length > 0,
			"Commitment message cannot be empty"
		);

		uint256 commitmentId = commitments.length;
		Commitment storage newCommitment = commitments.push();
		newCommitment.totalStake = msg.value;
		newCommitment.isActive = true;
		newCommitment.creationTime = block.timestamp;
		newCommitment.allProofsSubmitted = false;
		newCommitment.message = _message; // Store the commitment message

		newCommitment.participants.push(
			Participant({ addr: msg.sender, proof: "", voteCount: 0 })
		);

		for (uint i = 0; i < _participants.length; i++) {
			newCommitment.participants.push(
				Participant({ addr: _participants[i], proof: "", voteCount: 0 })
			);
		}

		emit CommitmentCreated(
			commitmentId,
			_participants,
			msg.value,
			newCommitment.creationTime,
			_message
		);
	}

	function submitProof(uint256 commitmentId, string memory proof) external {
		Commitment storage commitment = commitments[commitmentId];
		require(commitment.isActive, "Commitment is not active");
		require(
			block.timestamp < commitment.creationTime + COMMITMENT_DURATION,
			"Commitment period has ended"
		);

		bool isParticipant = false;
		for (uint i = 0; i < commitment.participants.length; i++) {
			if (commitment.participants[i].addr == msg.sender) {
				require(
					bytes(commitment.participants[i].proof).length == 0,
					"Proof already submitted"
				);
				commitment.participants[i].proof = proof;
				isParticipant = true;
				emit ProofSubmitted(commitmentId, msg.sender, proof);
				break;
			}
		}

		require(isParticipant, "Not a participant");

		bool allProofsSubmitted = true;
		for (uint i = 0; i < commitment.participants.length; i++) {
			if (bytes(commitment.participants[i].proof).length == 0) {
				allProofsSubmitted = false;
				break;
			}
		}

		if (allProofsSubmitted) {
			commitment.allProofsSubmitted = true;
			emit AllProofsSubmitted(commitmentId);
		}
	}

	function vote(uint256 commitmentId, address[] memory votedFor) external {
		Commitment storage commitment = commitments[commitmentId];
		require(!commitment.isCompleted, "Commitment is already completed");
		require(!commitment.hasVoted[msg.sender], "Already voted");
		require(
			commitment.allProofsSubmitted ||
				block.timestamp >=
				commitment.creationTime + COMMITMENT_DURATION,
			"Voting is not allowed yet"
		);

		commitment.hasVoted[msg.sender] = true;

		for (uint i = 0; i < votedFor.length; i++) {
			for (uint j = 0; j < commitment.participants.length; j++) {
				if (commitment.participants[j].addr == votedFor[i]) {
					commitment.participants[j].voteCount++;
					break;
				}
			}
		}

		emit VoteCast(commitmentId, msg.sender, votedFor);
	}

	function completeCommitment(uint256 commitmentId) external {
		Commitment storage commitment = commitments[commitmentId];
		require(!commitment.isCompleted, "Commitment is already completed");
		require(
			block.timestamp >= commitment.creationTime + COMMITMENT_DURATION,
			"Commitment period has not ended and not all proofs submitted"
		);

		uint256 winningVoteCount = commitment.participants.length;
		uint256 winnerCount = 0;

		for (uint i = 0; i < commitment.participants.length; i++) {
			if (commitment.participants[i].voteCount == winningVoteCount) {
				winnerCount++;
			}
		}

		require(winnerCount > 0, "No winners with unanimous votes");

		uint256 reward = commitment.totalStake / winnerCount;
		address[] memory winners = new address[](winnerCount);
		uint256 winnerIndex = 0;

		for (uint i = 0; i < commitment.participants.length; i++) {
			if (commitment.participants[i].voteCount == winningVoteCount) {
				_safeTransfer(commitment.participants[i].addr, reward);
				winners[winnerIndex] = commitment.participants[i].addr;
				winnerIndex++;
			}
		}

		commitment.isCompleted = true;

		emit CommitmentCompleted(commitmentId, winners, reward);
	}

	function _safeTransfer(address to, uint256 amount) internal {
		(bool success, ) = payable(to).call{ value: amount }("");
		require(success, "Transfer failed");
	}
}
