import { fetch } from "undici";

const cache: { [key: string]: number } = {};

/**
 * @description Get STX price in EUR for a given date.
 * We are caching the date to avoid making the same request for one date.
 * @param date - The date of data snapshot in dd-mm-yyyy eg. 30-12-2017
 */
export const getSTXPrice = async (date: string): Promise<number> => {
  if (cache[date]) {
    return cache[date];
  }
  const url = `https://api.coingecko.com/api/v3/coins/blockstack/history?date=${date}&localization=false`;
  const response = await fetch(url);
  const data = (await response.json()) as any;
  const price = data.market_data.current_price.eur;
  cache[date] = price;
  return price;
};

// https://api.coingecko.com/api/v3/coins/blockstack/history?date=07-06-2022
