"use client";

import { useState, useEffect } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import Web3 from "web3";
import BillForm from "../components/BillForm";
import BillInfo from "../components/BillInfo";
import { NextPage } from "next";

// Адрес контракта и ABI
const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

const abi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "payer", "type": "address" },
      { "indexed": true, "internalType": "bytes32", "name": "billId", "type": "bytes32" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "BillCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "payer", "type": "address" },
      { "indexed": true, "internalType": "bytes32", "name": "billId", "type": "bytes32" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "BillPaid",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "", "type": "bytes32" }
    ],
    "name": "bills",
    "outputs": [
      { "internalType": "address", "name": "payer", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "bool", "name": "paid", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_payer", "type": "address" },
      { "internalType": "bytes32", "name": "_billId", "type": "bytes32" },
      { "internalType": "uint256", "name": "_amount", "type": "uint256" }
    ],
    "name": "createBill",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_billId", "type": "bytes32" }
    ],
    "name": "getBill",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_billId", "type": "bytes32" }
    ],
    "name": "payBill",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];


const Page: NextPage = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { data: publicClient } = usePublicClient();
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);

  const [web3, setWeb3] = useState<Web3 | null>(null);

  useEffect(() => {
    if (walletClient) {
      const web3Instance = new Web3(walletClient);
      setWeb3(web3Instance);
    }
  }, [walletClient]);

  useEffect(() => {
    if (isConnected) {
      console.log("Пользователь подключен: ", address);
    }
  }, [isConnected, address]);

  const handleTransactionStatus = (status: string) => {
    setTransactionStatus(status);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center text-black mb-8">Bill Payment DApp</h1>

      {/* Компонент для создания счета или оплаты */}
      {web3 && (
        <BillForm
          contractAddress={contractAddress}
          abi={abi}
          web3={web3}
          address={address}
          onStatusChange={handleTransactionStatus}
        />
      )}

      {/* Компонент для отображения информации о счете */}
      <BillInfo contractAddress={contractAddress} abi={abi} web3={web3} />

      {/* Статус транзакции */}
      {transactionStatus && <div className="status mt-4 p-3 bg-gray-200 rounded-md text-center">{transactionStatus}</div>}
    </div>
  );
};

export default Page;