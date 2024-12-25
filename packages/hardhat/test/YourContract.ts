import { ethers } from "hardhat";
import { expect } from "chai";
import { BillPayment } from "../typechain-types";

describe("BillPayment Contract", function () {
  let billPayment: BillPayment;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async () => {
    const billPaymentFactory = await ethers.getContractFactory("BillPayment");
    billPayment = await billPaymentFactory.deploy();
    await billPayment.waitForDeployment();

    [owner, addr1, addr2] = await ethers.getSigners();
  });

  it("Should allow bill creation by the owner", async () => {
    const billId = ethers.keccak256(ethers.toUtf8Bytes("bill1"));
    const amount = ethers.parseEther("1");

    await billPayment.createBill(addr1.address, billId, amount);
    const bill = await billPayment.getBill(billId);

    expect(bill[0]).to.equal(addr1.address); // Проверяем плательщика
    expect(bill[1]).to.equal(amount); // Проверяем сумму
    expect(bill[2]).to.equal(false); // Проверяем статус оплаты
  });

  it("Should allow payment of a bill", async () => {
    const billId = ethers.keccak256(ethers.toUtf8Bytes("bill1"));
    const amount = ethers.parseEther("1");

    await billPayment.createBill(addr1.address, billId, amount);
    await billPayment.connect(addr1).payBill(billId, { value: amount });

    const bill = await billPayment.getBill(billId);
    expect(bill[2]).to.equal(true); // Проверяем, что счет оплачен
  });

  it("Should prevent payment of a non-existent bill", async () => {
    const billId = ethers.keccak256(ethers.toUtf8Bytes("nonexistent"));
    await expect(billPayment.payBill(billId, { value: ethers.parseEther("1") }))
      .to.be.revertedWith("Bill does not exist");
  });

  it("Should prevent underpayment of a bill", async () => {
    const billId = ethers.keccak256(ethers.toUtf8Bytes("bill1"));
    const amount = ethers.parseEther("1");

    await billPayment.createBill(addr1.address, billId, amount);
    await expect(billPayment.connect(addr1).payBill(billId, { value: ethers.parseEther("0.5") }))
      .to.be.revertedWith("Insufficient payment");
  });

  it("Should prevent duplicate bill payments", async () => {
    const billId = ethers.keccak256(ethers.toUtf8Bytes("bill1"));
    const amount = ethers.parseEther("1");

    await billPayment.createBill(addr1.address, billId, amount);
    await billPayment.connect(addr1).payBill(billId, { value: amount });

    await expect(billPayment.connect(addr1).payBill(billId, { value: amount }))
      .to.be.revertedWith("Bill already paid");
  });
});
