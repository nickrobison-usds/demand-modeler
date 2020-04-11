import React, { useContext } from "react";
import Card from "./Card/Card";
import { AppContext } from "../app/AppStore";
import { getCountyGrandTotal, GrandTotal } from "../utils/calculations";

interface Props {}

const USATotal: React.FunctionComponent<Props> = props => {
  const { state } = useContext(AppContext);

  const percentChange = (total: number, change: number): number => {
    return Math.round((change / total) * 100);
  };

  const defaultComparator = (a: any, b: any) => (a === b ? 0 : a < b ? -1 : 1);

  // TODO: just make getCountyGrandTotal data be indexed by Date objects?
  const grandTotals: GrandTotal = getCountyGrandTotal(state);
  const dates = Object.keys(grandTotals)
    .sort((a: string, b: string) => defaultComparator(new Date(a), new Date(b)))
    .reverse();

  const total = grandTotals[dates[0]]?.Confirmed;

  const renderChange = (current: number, previous: number) => {
    if (current === undefined || previous === undefined) {
      return "N/A";
    }
    const change = current - previous;
    return `${change >= 0 ? "+" : ""}${change} (${percentChange(
      current,
      change
    )} %)`;
  };

  return (
    <div style={{ display: "flex", textAlign: "center" }}>
      <Card header="Total">{total}</Card>
      <Card header="24 hour Change">
        {renderChange(total, grandTotals[dates[1]]?.Confirmed)}
      </Card>
      {/* <Card header="48 hour Change">
        {renderChange(total, grandTotals[dates[2]].Confirmed)}
      </Card> */}
    </div>
  );
};

export default USATotal;
