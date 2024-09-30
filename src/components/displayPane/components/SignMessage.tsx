import React, { FC, MouseEvent, useState, useEffect, ReactElement } from "react";
import { ethers } from "ethers";
import { Button, Input, message, Card, Row, Col } from "antd";
import { useWriteContract } from "hooks";
import { getEllipsisTxt } from "utils/formatters";
import Paragraph from "antd/es/skeleton/Paragraph";
import Title from "antd/es/skeleton/Title";
interface PoolAllocation {
  pool: string;
  amount: string;
}
const SignMessage: FC = (): ReactElement => {
  const [messageApi, contextHolder] = message.useMessage();
  const { loading: signLoading, signMessage } = useWriteContract();
  const [messageAuth, setMessageAuth] = useState<string>("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [currentAllocations, setCurrentAllocations] = useState<PoolAllocation[]>([]);
  const [priceLimit, setPriceLimit] = useState<string>("");
  const [newPriceLimit, setNewPriceLimit] = useState<string>("");
  const [withdrawPool, setWithdrawPool] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");

  useEffect(() => {
    const initContract = async () => {
      if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractAddress = "0x1234567890123456789012345678901234567890"; // Replace with actual deployed contract address
        const yieldManagerContract = new ethers.Contract(contractAddress, YieldManagerABI, signer);
        setContract(yieldManagerContract);

        const limit = await yieldManagerContract.priceLimit();
        setPriceLimit(ethers.utils.formatEther(limit));

        const allocations: PoolAllocation[] = [];
        let index = 0;
        while (true) {
          try {
            const allocation = await yieldManagerContract.currentAllocations(index);
            allocations.push({
              pool: allocation.pool,
              amount: ethers.utils.formatEther(allocation.amount)
            });
            index++;
          } catch (error) {
            break;
          }
        }
        setCurrentAllocations(allocations);
      }
    };

    initContract();
  }, []);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageAuth(e.target.value);
  };

  const handleSignMessage = async (event: MouseEvent<HTMLButtonElement>): Promise<void> => {
    event.preventDefault();

    const { success, data } = await signMessage(messageAuth);

    if (success) {
      messageApi.success(`Success! Transaction Hash: ${getEllipsisTxt(data, 8)}`);
    } else {
      messageApi.error(`An error occurred: ${data}`);
    }
  };

  const handleUpdatePriceLimit = async () => {
    if (contract && newPriceLimit) {
      try {
        const tx = await contract.updatePriceLimit(ethers.utils.parseEther(newPriceLimit));
        await tx.wait();
        setPriceLimit(newPriceLimit);
        setNewPriceLimit("");
        messageApi.success("Price limit updated successfully");
      } catch (error) {
        console.error("Error updating price limit:", error);
        messageApi.error("Failed to update price limit");
      }
    }
  };

  const handleWithdraw = async () => {
    if (contract && withdrawPool && withdrawAmount) {
      try {
        const tx = await contract.withdrawFromPool(withdrawPool, ethers.utils.parseEther(withdrawAmount));
        await tx.wait();
        setWithdrawPool("");
        setWithdrawAmount("");
        messageApi.success("Withdrawal successful");
      } catch (error) {
        console.error("Error withdrawing from pool:", error);
        messageApi.error("Failed to withdraw from pool");
      }
    }
  };

  return (
    <>
      <div style={{ padding: "24px" }}>
        {contextHolder}
        <Title level={2}>Combined Yield Manager Interface</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="Sign Message">
              <Input.TextArea
                value={messageAuth}
                onChange={handleMessageChange}
                placeholder="Input message to sign"
                style={{ marginBottom: "16px" }}
              />
              <Button type="primary" onClick={handleSignMessage} loading={signLoading}>
                Sign Message
              </Button>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Current Allocations">
              {currentAllocations.map((allocation, index) => (
                <Paragraph key={index}>
                  Pool: {allocation.pool}, Amount: {allocation.amount}
                </Paragraph>
              ))}
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Price Limit">
              <Paragraph>Current Price Limit: {priceLimit}</Paragraph>
              <Input
                value={newPriceLimit}
                onChange={(e) => setNewPriceLimit(e.target.value)}
                placeholder="New Price Limit"
                style={{ marginBottom: "16px" }}
              />
              <Button type="primary" onClick={handleUpdatePriceLimit}>
                Update Price Limit
              </Button>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Withdraw from Pool">
              <Input
                value={withdrawPool}
                onChange={(e) => setWithdrawPool(e.target.value)}
                placeholder="Pool Address"
                style={{ marginBottom: "16px" }}
              />
              <Input
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Amount to Withdraw"
                style={{ marginBottom: "16px" }}
              />
              <Button type="primary" onClick={handleWithdraw}>
                Withdraw
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default SignMessage;
