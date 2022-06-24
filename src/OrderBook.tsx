import React, { useEffect, useState, FC } from "react";

type PriceList = number[][];

interface OrderBook {
  asks: PriceList;
  bids: PriceList;
}

export interface Props {
  book: OrderBook;
  fairMarket: number;
}

export interface ListProps {
  list: PriceList;
  type: string;
  indexEmphasized?: number;
  emphasize: (index: number) => void;
  showClickedPrice: (price: number) => void;
}

const renderList: FC<ListProps> = (props) => {
  const [emphasizeIndex, setEmphasizeIndex] = useState<number | undefined>(
    undefined
  );
  useEffect(() => {
    setEmphasizeIndex(props.indexEmphasized);
  }, [props.indexEmphasized]);

  const handleTrailingZero = (number: number, type: string) => {
    let len = type === "price" ? 1 : 3;
    let stringedNum = number.toFixed(len).toString();
    if (stringedNum.charAt(stringedNum.length - 1) === "0") {
      return (
        <div>
          <span>{stringedNum.slice(0, stringedNum.length - 1)}</span>
          <span style={{ opacity: "0.65" }}>{stringedNum.slice(-1)}</span>
        </div>
      );
    } else {
      return number.toFixed(len);
    }
  };

  return (
    <ol
      style={{
        listStyle: "none",
        padding: "0",
        display: "flex",
        flexDirection: props.type === "asks" ? "column-reverse" : "column",
        cursor: "pointer",
      }}
    >
      {props.list.map(([price, amt, sum], index) => {
        return (
          <li
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "240px",
            }}
            className={emphasizeIndex === index ? "emphasize" : ""}
            onMouseEnter={() => props.emphasize(index)}
            onClick={() => props.showClickedPrice(price)}
          >
            <div
              style={{
                minWidth: "60px",
                color: props.type === "asks" ? "darkred" : "darkgreen",
              }}
            >
              {handleTrailingZero(price, "price")}
            </div>
            <div
              style={{ minWidth: "60px", color: "grey", textAlign: "right" }}
            >
              {handleTrailingZero(amt, "amount")}
            </div>
            <div
              style={{ minWidth: "60px", color: "grey", textAlign: "right" }}
            >
              {handleTrailingZero(sum, "amount")}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export const OrderBook = ({ book, fairMarket }: Props) => {
  const { bids, asks } = book;
  const limitedAsks = asks.slice(0, 10);
  const limitedBids = bids.slice(0, 10);
  const [emphasizedRows, setEmphasizedRows] = useState<number | undefined>(
    undefined
  );
  const [showPriceBox, setShowPriceBox] = useState<boolean>(false);
  const [shownPrice, setShownPrice] = useState<number>(0);

  const emphasize = (index: number): void => {
    // NOTE: I went to the Cryptowatch tool to see if I could glean exactly how the on-hover state "chose" what to highlight on the other
    // side of the book, and given that the data moved so fast I couldn't exactly tell what logic was going on here. Sometimes, the other side
    //emphasis there wouldn't render at all on the Cryptowatch tool.  So this methodology below is "fudged" and for now just highlights the same
    // index on the opposite side
    setEmphasizedRows(index);
  };

  const showClickedPrice = (price: number) => {
    setShownPrice(price);
    setShowPriceBox(true);
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {renderList({
          list: limitedAsks,
          type: "asks",
          indexEmphasized: emphasizedRows,
          emphasize: emphasize,
          showClickedPrice: showClickedPrice,
        })}
      </div>
      <div style={{ textAlign: "center" }}>{fairMarket.toFixed(1)} USD</div>
      <div style={{ textAlign: "center" }}>
        {renderList({
          list: limitedBids,
          type: "bids",
          indexEmphasized: emphasizedRows,
          emphasize: emphasize,
          showClickedPrice: showClickedPrice,
        })}
      </div>
      <div
        className={showPriceBox ? "visible-price-box" : "hidden-price-box"}
        style={{
          border: "2px solid white",
          borderRadius: "4px",
          padding: "10px 20px",
          minWidth: "50%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{shownPrice.toFixed(1)}</span>
        <span
          onClick={() => setShowPriceBox(false)}
          style={{ fontSize: "10px", cursor: "pointer" }}
        >
          X
        </span>
      </div>
    </div>
  );
};
