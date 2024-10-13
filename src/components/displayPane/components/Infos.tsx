import React from "react";
import { useWeb3React, Web3ReactHooks } from "@web3-react/core";
import { Typography } from "antd";
import { formatUnits } from "@ethersproject/units";

const { Paragraph } = Typography;

import { CHAINS } from "data/networks";
import { useNativeBalance, useWindowSize } from "hooks";
import { getEllipsisTxt } from "utils/formatters";

const styles = {
  display: {
    paddingBlock: "0 15px",
    display: "flex",
    flexDirection: "column"
  },
  statusText: {
    fontSize: "17px"
  },
  statusValue: {
    fontWeight: 800
  }
} as const;

interface InfosProps {
  chainId: ReturnType<Web3ReactHooks["useChainId"]>;
}

const Infos: React.FC<InfosProps> = ({ chainId }) => {
  const { account, provider } = useWeb3React();
  const balance = useNativeBalance(provider, account);
  const { isTablet } = useWindowSize();

  if (chainId === undefined) return null;
  const name = chainId ? CHAINS[chainId]?.name : undefined;

  const formattedBalance = balance ? parseFloat(formatUnits(balance, 18)).toFixed(4) : "0";

  return (
    <Typography style={styles.display}>
      <Paragraph style={styles.statusText}>
        Address:{" "}
        {!isTablet ? (
          <span style={styles.statusValue}>{account}</span>
        ) : (
          <span style={styles.statusValue}>{account && getEllipsisTxt(account, 4)}</span>
        )}
      </Paragraph>

      <Paragraph style={styles.statusText}>
        {name ? (
          <>
            Chain:{" "}
            <span style={styles.statusValue}>
              {name} ({chainId})
            </span>
          </>
        ) : (
          <>
            Chain Id: <span style={styles.statusValue}>{chainId}</span>
          </>
        )}
      </Paragraph>

      <Paragraph style={styles.statusText}>
        Balance: <span style={styles.statusValue}>Ξ {formattedBalance}</span>
      </Paragraph>
    </Typography>
  );
};

export default Infos;
