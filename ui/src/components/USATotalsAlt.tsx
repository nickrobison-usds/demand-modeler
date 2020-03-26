import React, { useContext } from "react";
import "../pages/Dashboard.scss";
import { AppContext } from "../app/AppStore";
import { CovidDateData } from "../app/AppStore";
import { getCountyGrandTotal, GrandTotal } from "../utils/calculations";
import { getSelectedLocationName } from "../utils/utils";

interface Props {

};

const USATotalsAlt: React.FunctionComponent<Props> = props => {
  const { state } = useContext(AppContext);

  const percentChange = (total: number, change: number): number => {
    return Math.round((change / total) * 100);
  };

  const grandTotals: GrandTotal = getCountyGrandTotal(state);
  const dates = Object.keys(grandTotals)
    .sort()
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
    <div className="total-wrap">
      <h1>locationName</h1>
      <div className="total-item">
        <label className="usa-label">Confirmed cases</label>
        <span>{total}</span>
      </div>
      <div className="total-item">
        <label className="usa-label">24-hour change</label>
        <span>{renderChange(total, grandTotals[dates[1]]?.Confirmed)}
        </span>
        {/* <Card header="48 hour Change">
          {renderChange(total, grandTotals[dates[2]].Confirmed)}
        </Card> */}
      </div>
    </div>
  );
};

export default USATotalsAlt;
