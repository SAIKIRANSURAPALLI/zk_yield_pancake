import { useMemo } from "react";
import type { Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import type { Signer, JsonRpcSigner } from "ethers";

interface SignerOrProvider {
  provider: Provider | undefined;
  signer: Signer | JsonRpcSigner | undefined;
}

export const useSignerOrProvider = (): SignerOrProvider => {
  const { provider, account } = useWeb3React();

  return useMemo(() => {
    let signer: Signer | JsonRpcSigner | undefined;
    if (provider && account && "getSigner" in provider) {
      signer = provider.getSigner(account) as unknown as JsonRpcSigner;
    }

    return { provider, signer };
  }, [provider, account]);
};
