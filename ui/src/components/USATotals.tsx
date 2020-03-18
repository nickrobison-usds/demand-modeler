import React, { useContext } from "react";
import Card from "./Card/Card";
import { AppContext, State } from "../app/AppStore";
import { getPreviousDate } from "../utils/DateUtils";

const USATotal: React.FunctionComponent<{}> = props => {
  const { state } = useContext(AppContext);

  let confirmed = 0;
  let dead = 0;
  let previousConfirmed = 0;
  let previousDead = 0;
  const selectedDate = state.selection.date;
  const slectedStates = state.covidTimeSeries[selectedDate].states;
  Object.values(slectedStates).forEach((c: State) => {
    confirmed += c.Confirmed;
    dead += c.Dead;
  });

  const previousDate = getPreviousDate(state.selection.date);
  const previousStates = state.covidTimeSeries[previousDate].states;
  Object.values(previousStates).forEach((c: State) => {
    previousConfirmed += c.Confirmed;
    previousDead += c.Dead;
  });

  const renderChange = (current: number, previous: number): string => {
    const change = current - previous;
    return `${change >= 0 ? "+" : "-"}${change}`
  };

  return (
    <div style={{ display: "flex", textAlign: "center" }}>
      <Card header="Confirmed">{confirmed} ({renderChange(confirmed, previousConfirmed)})</Card>
      <Card header="Dead">{dead} ({renderChange(dead, previousDead)})</Card>
    </div>
  );
};

export default USATotal;
