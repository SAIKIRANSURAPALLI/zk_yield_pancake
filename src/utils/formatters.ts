import { formatUnits, parseUnits } from "ethers";

// Formatting functions for numbers and currency
export const n6 = new Intl.NumberFormat("en-us", {
  style: "decimal",
  minimumFractionDigits: 0,
  maximumFractionDigits: 6
});

export const n4 = new Intl.NumberFormat("en-us", {
  style: "decimal",
  minimumFractionDigits: 0,
  maximumFractionDigits: 4
});

export const c2 = new Intl.NumberFormat("en-us", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

// Shorten a string with ellipsis
export const getEllipsisTxt = (str: string, n = 6): string => {
  if (!str) return "";
  return str.length > 2 * n ? `${str.slice(0, n)}...${str.slice(-n)}` : str;
};

// Token value conversion based on decimals
export const tokenValue = (value: bigint, decimals: number): number => {
  return parseFloat(formatUnits(value, decimals));
};

// Format token value as text with a symbol
export const tokenValueTxt = (value: bigint, decimals: number, symbol: string): string => {
  return `${n4.format(tokenValue(value, decimals))} ${symbol}`;
};

// Format a bigint with optional decimals
export const formatBigNumber = (value: bigint, decimals = 18): string => {
  return formatUnits(value, decimals);
};

// Parse a string into a bigint with optional decimals
export const parseBigNumber = (value: string, decimals = 18): bigint => {
  return parseUnits(value, decimals);
};

// Format a number as USD currency
export const formatUSD = (value: number): string => {
  return c2.format(value);
};

// Shorten an Ethereum address
export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

// Format Unix timestamp into a readable date string
export const formatUnixTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};
