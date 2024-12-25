import React, { useState } from "react";
import Web3 from "web3";

interface BillInfoProps {
    contract: any;
}

const BillInfo: React.FC<BillInfoProps> = ({ contract }) => {
    const [billId, setBillId] = useState<string>("");
    const [billDetails, setBillDetails] = useState<any>(null);

    const getBillInfo = async () => {
        try {
            const bill = await contract.getBill(Web3.utils.asciiToHex(billId));
            setBillDetails({
                payer: bill[0],
                amount: Web3.utils.fromWei(bill[1], "ether"),
                paid: bill[2],
            });
        } catch (error) {
            console.error("Error fetching bill info:", error);
            alert("Error fetching bill info.");
        }
    };

    return (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
            <div className="mb-4">
                <label htmlFor="billId" className="block text-lg font-semibold">Enter Bill ID</label>
                <input
                    id="billId"
                    type="text"
                    value={billId}
                    onChange={(e) => setBillId(e.target.value)}
                    className="mt-2 p-3 w-full border border-gray-300 rounded-md"
                />
            </div>
            <button onClick={getBillInfo} className="px-6 py-3 bg-purple-500 text-white rounded-md">Get Bill Info</button>
            {billDetails && (
                <div className="mt-4 p-4 bg-gray-100 rounded-md">
                    <p><strong>Payer:</strong> {billDetails.payer}</p>
                    <p><strong>Amount:</strong> {billDetails.amount} ETH</p>
                    <p><strong>Status:</strong> {billDetails.paid ? "Paid" : "Unpaid"}</p>
                </div>
            )}
        </div>
    );
};

export default BillInfo;
