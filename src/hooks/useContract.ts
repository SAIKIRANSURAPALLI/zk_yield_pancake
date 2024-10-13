import { useMemo } from "react";
import { AddressZero } from "@ethersproject/constants";
import { Provider } from "@ethersproject/providers";
import { Contract, ContractInterface, Signer } from "ethers";
import { isAddress } from "ethers";

import { useSignerOrProvider } from "./useSignerOrProvider";

function getContract<T = Contract>(address: string, abi: ContractInterface, signerOrProvider: Signer | Provider) {
  return new Contract(address, abi, signerOrProvider) as T;
}

export function useContract<T = Contract>(address: string, abi: ContractInterface) {
  const { provider, signer } = useSignerOrProvider();
  const signerOrProvider = signer ?? provider;

  return useMemo(() => {
    if (!address || !isAddress(address) || address === AddressZero || !signerOrProvider) {
      console.error(`Invalid 'address' parameter '${address}' or missing signer/provider.`);
      return null;
    }
    try {
      return getContract<T>(address, abi, signerOrProvider);
    } catch (error) {
      console.error("Failed to get contract", error);
      return null;
    }
  }, [address, abi, signerOrProvider]);
}
