// SPDX-License-Identifier: MIT
pragma solidity >=0.8.20;

contract Crowdfunding {
    constructor() {}

    struct Milestone {
        uint256 amount;
        bool isReleased;
        string proofIPFSHash;
    }

    struct Campaign {
        address creator;
        string title;
        string description;
        uint256 goal;
        uint256 amountRaised;
        bool completed;
        string projectDocument; // <-- New line: IPFS hash of project doc/image
        mapping(address => uint256) contributions;
        Milestone[] milestones;
    }

    struct MilestoneVote {
        uint256 yesVotes;
        uint256 noVotes;
        uint256 startTime;
        bool finalized;
        mapping(address => bool) hasVoted;
    }

    mapping (uint256 => Campaign) public campaigns;
    mapping (uint256 => mapping(uint256 => MilestoneVote)) public milestoneVotes;
    uint256 public campaignCount = 0;
    uint256 public votingDuration = 3 days;

    event CampaignCreated(uint256 campaignId, address creator, string title, uint256 goal, string projectDocument);
    event Funded(uint256 campaignId, address funder, uint256 amount);
    event MilestoneClaimed(uint256 campaignId, uint256 milestoneId, string proofIPFSHash);
    event MilestoneFinalized(uint256 campaignId, uint256 milestoneId, bool approved);
    event Withdrawn(uint256 campaignId, address creator, uint256 amount);
    event Refunded(uint256 campaignId, address funder, uint256 amount);

    modifier validCampaign(uint256 _campaignId) {
        require(_campaignId < campaignCount, "Invalid campaign ID");
        _;
    }

    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _goal,
        uint256[] memory _milestoneAmounts,
        string memory _projectDocument // <-- extra parameter
    ) public {
        require(_goal > 0, "Goal must be greater than 0");

        uint256 totalMilestones;
        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            totalMilestones += _milestoneAmounts[i];
        }
        require(totalMilestones == _goal, "Milestones total must match goal");

        Campaign storage newCampaign = campaigns[campaignCount];
        newCampaign.creator = msg.sender;
        newCampaign.title = _title;
        newCampaign.description = _description;
        newCampaign.goal = _goal;
        newCampaign.amountRaised = 0;
        newCampaign.completed = false;
        newCampaign.projectDocument = _projectDocument; // store IPFS hash

        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            newCampaign.milestones.push(Milestone({
                amount: _milestoneAmounts[i],
                isReleased: false,
                proofIPFSHash: ""
            }));
        }

        emit CampaignCreated(campaignCount, msg.sender, _title, _goal, _projectDocument);
        campaignCount++;
    }

    function fund(uint256 _campaignId) public payable validCampaign(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(!campaign.completed, "Campaign already completed");
        require(msg.value > 0, "Funding amount must be greater than 0");

        campaign.amountRaised += msg.value;
        campaign.contributions[msg.sender] += msg.value;

        emit Funded(_campaignId, msg.sender, msg.value);
    }

    function claimMilestone(uint256 _campaignId, uint256 _milestoneId, string memory _proofIPFSHash) public validCampaign(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender == campaign.creator, "Only creator can claim milestone");
        require(!campaign.milestones[_milestoneId].isReleased, "Milestone already claimed");
        require(campaign.amountRaised >= campaign.goal, "Campaign goal not reached yet");

        if (_milestoneId == 0) {
            // First milestone: Direct release, no proof
            campaign.milestones[_milestoneId].isReleased = true;
            payable(campaign.creator).transfer(campaign.milestones[_milestoneId].amount);
            emit MilestoneClaimed(_campaignId, _milestoneId, "");
        } else {
            // Second onwards: Proof upload mandatory
            require(bytes(_proofIPFSHash).length > 0, "Proof required for milestones after first");
            campaign.milestones[_milestoneId].proofIPFSHash = _proofIPFSHash;
            milestoneVotes[_campaignId][_milestoneId].startTime = block.timestamp;
            emit MilestoneClaimed(_campaignId, _milestoneId, _proofIPFSHash);
        }
    }

    function voteOnMilestone(uint256 _campaignId, uint256 _milestoneId, bool approve) public validCampaign(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.contributions[msg.sender] > 0, "Only contributors can vote");
        MilestoneVote storage vote = milestoneVotes[_campaignId][_milestoneId];

        require(block.timestamp <= vote.startTime + votingDuration, "Voting period over");
        require(!vote.hasVoted[msg.sender], "Already voted");

        vote.hasVoted[msg.sender] = true;
        if (approve) {
            vote.yesVotes++;
        } else {
            vote.noVotes++;
        }
    }

    function finalizeMilestone(uint256 _campaignId, uint256 _milestoneId) public validCampaign(_campaignId) {
        MilestoneVote storage vote = milestoneVotes[_campaignId][_milestoneId];
        Campaign storage campaign = campaigns[_campaignId];
        require(!vote.finalized, "Already finalized");
        require(block.timestamp >= vote.startTime + votingDuration, "Voting period not over");

        vote.finalized = true;

        if (vote.yesVotes > vote.noVotes) {
            campaign.milestones[_milestoneId].isReleased = true;
            payable(campaign.creator).transfer(campaign.milestones[_milestoneId].amount);
            emit MilestoneFinalized(_campaignId, _milestoneId, true);
        } else {
            emit MilestoneFinalized(_campaignId, _milestoneId, false);
        }
    }

    function refund(uint256 _campaignId) public validCampaign(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.amountRaised < campaign.goal, "Campaign goal achieved, no refund");
        require(campaign.contributions[msg.sender] > 0, "No contributions to refund");

        uint256 amount = campaign.contributions[msg.sender];
        campaign.contributions[msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit Refunded(_campaignId, msg.sender, amount);
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getCampaign(uint256 _campaignId) public view validCampaign(_campaignId) returns (
        address creator,
        string memory title,
        string memory description,
        uint256 goal,
        uint256 amountRaised,
        bool completed,
        string memory projectDocument,
        uint256 milestoneCount
    ) {
        Campaign storage c = campaigns[_campaignId];
        return (c.creator, c.title, c.description, c.goal, c.amountRaised, c.completed, c.projectDocument, c.milestones.length);
    }

    function getMilestone(uint256 _campaignId, uint256 _milestoneId) public view validCampaign(_campaignId) returns (
        uint256 amount,
        bool isReleased,
        string memory proofIPFSHash
    ) {
        Campaign storage c = campaigns[_campaignId];
        Milestone storage m = c.milestones[_milestoneId];
        return (m.amount, m.isReleased, m.proofIPFSHash);
    }
}
