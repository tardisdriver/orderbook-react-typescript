export type OrderbookWorkerMessage = {
  data: { asks: [number, number][]; bids: [number, number][] };
};
