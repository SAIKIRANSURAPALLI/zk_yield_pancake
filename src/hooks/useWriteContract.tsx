import { useCallback, useState } from "react";
import { ethers } from "ethers";
import { useSignerOrProvider } from "./useSignerOrProvider";

export const useWriteContract = () => {
  const { signer } = useSignerOrProvider();
  const [loading, setLoading] = useState<boolean>(false);

  const signMessage = useCallback(
    async (messageAuth: string): Promise<{ success: boolean; data: string }> => {
      setLoading(true);
      try {
        if (!signer) {
          throw new Error("Signer not available");
        }
        const message = messageAuth || "Hello Web3!";
        const signature = await signer.signMessage(message);
        return { success: true, data: signature };
      } catch (error: any) {
        console.error("Error signing message:", error);
        return { success: false, data: error.message || "An error occurred while signing the message" };
      } finally {
        setLoading(false);
      }
    },
    [signer]
  );

  const transferNative = useCallback(
    async (
      receiver: string,
      amount: string
    ): Promise<{ success: boolean; data: ethers.TransactionReceipt | string }> => {
      setLoading(true);
      try {
        if (!signer) {
          throw new Error("Signer not available");
        }
        if (!ethers.isAddress(receiver)) {
          throw new Error("Invalid receiver address");
        }
        if (parseFloat(amount) <= 0) {
          throw new Error("Invalid amount");
        }

        const tx = await signer.sendTransaction({
          to: receiver,
          value: ethers.parseEther(amount)
        });

        const receipt = await tx.wait(2);
        return { success: true, data: receipt };
      } catch (error: any) {
        console.error("Error transferring native currency:", error);
        return { success: false, data: error.message || "An error occurred during the transfer" };
      } finally {
        setLoading(false);
      }
    },
    [signer]
  );

  return {
    loading,
    signMessage,
    transferNative
  };
};
