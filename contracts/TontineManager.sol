// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TontineManager {

    address public president;
    uint256 public cotisation;
    bool public cycleActive;

    address[] public members;
    mapping(address => bool) public hasBenefited;

    event MemberAdded(address member);
    event CotisationPaid(address member, uint256 amount);
    event BeneficiaryPaid(address beneficiary, uint256 amount);

    modifier onlyPresident() {
        require(msg.sender == president, "Not president");
        _;
    }

    modifier cycleStarted() {
        require(cycleActive, "Cycle not active");
        _;
    }

    constructor(uint256 _cotisation) {
        president = msg.sender;
        cotisation = _cotisation;
    }

    function startCycle() external onlyPresident {
        cycleActive = true;
    }

    function addMember(address member) external onlyPresident {
        members.push(member);
        emit MemberAdded(member);
    }

    function payCotisation() external payable cycleStarted {
        require(msg.value == cotisation, "Incorrect amount");
        emit CotisationPaid(msg.sender, msg.value);
    }

    function distribute() external onlyPresident cycleStarted {
        require(members.length > 0, "No members");

        address beneficiary = members[0];
        require(!hasBenefited[beneficiary], "Already benefited");

        uint256 amount = address(this).balance;
        hasBenefited[beneficiary] = true;

        payable(beneficiary).transfer(amount);
        emit BeneficiaryPaid(beneficiary, amount);

        _shiftMembers();
    }

    function _shiftMembers() internal {
        for (uint i = 0; i < members.length - 1; i++) {
            members[i] = members[i + 1];
        }
        members.pop();
    }
}
