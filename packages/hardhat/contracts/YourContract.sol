// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BillPayment {
    struct Bill {
        address payer;
        uint256 amount;
        bool paid;
    }

    mapping(bytes32 => Bill) public bills;
    address public owner;

    event BillCreated(address indexed payer, bytes32 indexed billId, uint256 amount);
    event BillPaid(address indexed payer, bytes32 indexed billId, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createBill(address _payer, bytes32 _billId, uint256 _amount) external onlyOwner {
        require(bills[_billId].amount == 0, "Bill already exists");
        bills[_billId] = Bill({
            payer: _payer,
            amount: _amount,
            paid: false
        });
        emit BillCreated(_payer, _billId, _amount);
    }

    function payBill(bytes32 _billId) external payable {
        Bill storage bill = bills[_billId];
        require(bill.amount > 0, "Bill does not exist");
        require(!bill.paid, "Bill already paid");
        require(msg.value >= bill.amount, "Insufficient payment");

        bill.paid = true;
        emit BillPaid(msg.sender, _billId, msg.value);

        // Refund excess payment, if any
        if (msg.value > bill.amount) {
            payable(msg.sender).transfer(msg.value - bill.amount);
        }
    }

    function getBill(bytes32 _billId) external view returns (address, uint256, bool) {
        Bill memory bill = bills[_billId];
        return (bill.payer, bill.amount, bill.paid);
    }
}
