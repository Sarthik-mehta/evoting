pragma solidity ^0.5.16;

contract Election{
    //model a candidate
    struct Candidate{
        uint id;
        string name;
        uint voteCount;
    }
    //store accounts that have voted
    mapping(address=> bool) public voters;
    //store candidates
    mapping(uint=> Candidate) public candidates;
    //fetch candidate
    //store candidate count
    uint public candidatesCount;

    //voted event
    event votedEvent (
        uint indexed _candidateId
    );

    constructor() public{
        addCandidate("BJP");
        addCandidate("AAP");
        addCandidate("Congress");
    }

    function addCandidate(string memory _name) public {
        candidatesCount++;
        candidates[candidatesCount ] = Candidate(candidatesCount, _name,0);
    }

    function vote(uint _candidateId) public {

        //require that the have not voted before
        require(!voters[msg.sender]);
        //require a valid candidate
        require(_candidateId>0 && _candidateId<=candidatesCount);
        //msg.sender contains the voters id
        //record that voter has voted
        voters[msg.sender]=true;
        candidates[_candidateId].voteCount++;
        emit votedEvent (_candidateId);
    }
}
