import React, { useState, useEffect } from "react";
import Web3 from "web3";

interface BillFormProps {
  contractAddress: string;
  abi: any;
  web3: Web3;
  address: string | undefined;
  onStatusChange: (status: string) => void;
}

const BillForm: React.FC<BillFormProps> = ({ contractAddress, abi, web3, address, onStatusChange }) => {
  const [billId, setBillId] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [contract, setContract] = useState<any>(null);

  // Инициализация контракта
  useEffect(() => {
    if (web3 && contractAddress && abi) {
      const contractInstance = new web3.eth.Contract(abi, contractAddress);
      setContract(contractInstance);
    }
  }, [web3, contractAddress, abi]);

  const createBill = async () => {
    if (!contract) {
      onStatusChange("Контракт не инициализирован.");
      return;
    }
    if (!address) {
      onStatusChange("Пользователь не подключен.");
      return;
    }

    onStatusChange("Создание счета...");
    try {
      const tx = await contract.methods
        .createBill(address, web3.utils.asciiToHex(billId), web3.utils.toWei(amount.toString(), "ether"))
        .send({ from: address });
      await tx.wait();
      onStatusChange("Счет создан успешно!");
    } catch (error) {
      onStatusChange("Ошибка при создании счета.");
      console.error(error);
    }
  };

  const payBill = async () => {
    if (!contract) {
      onStatusChange("Контракт не инициализирован.");
      return;
    }
    if (!address) {
      onStatusChange("Пользователь не подключен.");
      return;
    }

    onStatusChange("Оплата счета...");
    try {
      const tx = await contract.methods.payBill(web3.utils.asciiToHex(billId)).send({
        from: address,
        value: web3.utils.toWei(amount.toString(), "ether"),
      });
      await tx.wait();
      onStatusChange("Счет оплачен успешно!");
    } catch (error) {
      onStatusChange("Ошибка при оплате счета.");
      console.error(error);
    }
  };

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <label htmlFor="billId" className="block text-lg font-semibold">Bill ID</label>
        <input
          id="billId"
          type="text"
          value={billId}
          onChange={(e) => setBillId(e.target.value)}
          className="mt-2 p-3 w-full border border-gray-300 rounded-md"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="amount" className="block text-lg font-semibold">Amount (ETH)</label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          className="mt-2 p-3 w-full border border-gray-300 rounded-md"
        />
      </div>
      <div className="flex space-x-4">
        <button onClick={createBill} className="px-6 py-3 bg-blue-500 text-white rounded-md">Create Bill</button>
        <button onClick={payBill} className="px-6 py-3 bg-green-500 text-white rounded-md">Pay Bill</button>
      </div>
    </div>
  );
};

export default BillForm;
