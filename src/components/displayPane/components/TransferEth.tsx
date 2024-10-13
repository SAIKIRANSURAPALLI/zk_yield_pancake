import React, { MouseEvent, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { Button, InputNumber, message } from "antd";
import { useNativeBalance, useWriteContract } from "hooks";
import { getEllipsisTxt } from "utils/formatters";
import AddressInput from "../../AddressInput";

const styles = {
  buttonTransfer: {
    display: "flex",
    margin: "15px 0"
  }
} as const;

interface TransferResult {
  success: boolean;
  data: string | { transactionHash?: string };
}

const TransferEth: React.FC = () => {
  const { account, provider } = useWeb3React();
  const [messageApi, contextHolder] = message.useMessage();
  const { loading, transferNative } = useWriteContract();

  const balance = useNativeBalance(provider, account);
  const formattedBalance = balance ? Number(balance.toString()) : 0;

  const [amount, setAmount] = useState<number | null>(null);
  const [receiver, setReceiver] = useState<string | undefined>();

  const handleTransfer = async (event: MouseEvent<HTMLButtonElement>): Promise<void> => {
    event.preventDefault();

    if (!receiver) {
      messageApi.error("The receiver address is missing. Please check your input.");
      return;
    }

    if (amount === 0) {
      messageApi.error("The amount can't be 0. Make sure your balance is positive, and double check your input.");
      return;
    }

    if (!amount) {
      messageApi.error("The amount is missing. Please double check your input.");
      return;
    }

    const { success, data } = (await transferNative(receiver, amount.toString())) as TransferResult;

    if (success) {
      const txHash = typeof data === "string" ? data : data?.transactionHash;
      messageApi.success(`Success! Transaction Hash: ${getEllipsisTxt(txHash ?? "Transaction Hash missing.", 8)}`);
    } else {
      messageApi.error(`An error occurred: ${JSON.stringify(data)}`);
    }
  };

  return (
    <>
      {contextHolder}
      <div style={{ width: "40%", minWidth: "250px" }}>
        <AddressInput onChange={setReceiver} address={receiver} />
        <div style={{ display: "inline-flex", gap: "10px", width: "100%" }}>
          <InputNumber
            value={amount}
            onChange={setAmount}
            placeholder="Amount to transfer"
            min={0}
            max={formattedBalance}
            style={{ width: "100%", height: "80%", marginBlock: "auto" }}
          />

          <div style={styles.buttonTransfer}>
            <Button type="primary" shape="round" onClick={handleTransfer} loading={loading} disabled={loading}>
              Transfer
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TransferEth;
