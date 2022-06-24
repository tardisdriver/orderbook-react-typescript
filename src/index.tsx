import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { OrderbookWorkerMessage } from "./data/types";
import "./styles.css";
import { OrderBook } from "./OrderBook";

interface ISterileData {
  asks: number[][];
  bids: number[][];
}

const App = (): JSX.Element => {
  const [sterileData, setSterileData] = useState<ISterileData | null>(null);
  const [fairMarket, setFairMarket] = useState<number>(0);
  // moved worker code to a useEffect hook to 1) prevent registering a new worker on every new render and 2) get access to useState to get data to child
  // (as trying to do this in the .onmessage hook as it was written caused app crashing)
  useEffect(() => {
    const ob = new Worker(new URL("./data/worker.js", import.meta.url));
    ob.onmessage = (e: OrderbookWorkerMessage) => {
      const convertToNumber = () => {
        let sum = 0;
        // return a curried function to handle sanitization of strings and adding cumulative total
        return (
          x: (string | number)[],
          index: number,
          arr: (string | number)[][]
        ) => {
          const sanitized = x.map((y) =>
            typeof y === "string" ? parseFloat(y) : y
          );

          sum += Number(arr[index][1]);

          return [...sanitized, sum];
        };
      };

      const sterilizedData = {
        asks: e.data.asks.map(convertToNumber()),
        bids: e.data.bids.map(convertToNumber()),
      };

      setSterileData(sterilizedData);
      // NOTE: I'm honestly not 100% sure how fair market value is calculated just off book data alone, so I "fudged" this number by
      // taking the average of the first index of the asks and bids
      setFairMarket((e.data.asks[0][0] + e.data.bids[0][0]) / 2);
    };
  }, []);

  return (
    <div className="page-container">
      {sterileData !== null ? (
        <OrderBook book={sterileData} fairMarket={fairMarket} />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
