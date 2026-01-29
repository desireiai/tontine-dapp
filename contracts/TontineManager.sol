// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TontineManager {
    address public president;
    uint256 public cotisation;
    bool public cycleStarted;

    address[] private members;

    mapping(address => bool) public isMember;
    mapping(address => bool) public hasPaid;
    mapping(address => bool) public hasBenefited;
    mapping(address => uint256) public memberIndex;

    event MemberAdded(address member);
    event CycleStarted();
    event CotisationPaid(address member, uint256 amount);
    event BeneficiaryPaid(address beneficiary, uint256 amount);

    modifier onlyPresident() {
        require(msg.sender == president, "Not president");
        _;
    }

    modifier cycleActive() {
        require(cycleStarted, "Cycle not started");
        _;
    }

    constructor(uint256 _cotisation) {
        president = msg.sender;
        cotisation = _cotisation;
    }

    function startCycle() external onlyPresident {
        require(!cycleStarted, "Cycle already started");
        cycleStarted = true;
        emit CycleStarted();
    }

    function addMember(address _member) external onlyPresident {
        require(!cycleStarted, "Cannot add during cycle");
        require(!isMember[_member], "Already member");

        memberIndex[_member] = members.length;
        members.push(_member);
        isMember[_member] = true;

        emit MemberAdded(_member);
    }

    function payCotisation() external payable cycleActive {
        require(isMember[msg.sender], "Not a member");
        require(!hasPaid[msg.sender], "Already paid");
        require(msg.value == cotisation, "Incorrect amount");

        hasPaid[msg.sender] = true;
        emit CotisationPaid(msg.sender, msg.value);
    }

    function distribute() external onlyPresident cycleActive {
        require(members.length > 0, "No members");

        address beneficiary = members[0];
        require(!hasBenefited[beneficiary], "Already benefited");

        uint256 amount = address(this).balance;
        hasBenefited[beneficiary] = true;

        (bool success, ) = payable(beneficiary).call{value: amount}("");
        require(success, "Transfer failed");

        emit BeneficiaryPaid(beneficiary, amount);

        _shiftMembers();
    }

    function _shiftMembers() internal {
        for (uint256 i = 0; i < members.length - 1; i++) {
            members[i] = members[i + 1];
            memberIndex[members[i]] = i;
        }
        members.pop();
    }

    function getMembers() external view returns (address[] memory) {
        return members;
    }
}
