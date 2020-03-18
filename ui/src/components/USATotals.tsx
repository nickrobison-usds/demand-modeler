import React, { useContext } from "react";
import Card from "./Card/Card";
import { AppContext, State } from "../app/AppStore";

const USATotal: React.FunctionComponent<{}> = props => {
  const { state } = useContext(AppContext);

  let confirmed = 0;
  let dead = 0;
  const states = state.covidTimeSeries[state.selection.date].states;
  Object.values(states).forEach((c: State) => {
    confirmed += c.Confirmed;
    dead += c.Dead;
  });
  return (
    <div style={{ display: "flex", textAlign: "center" }}>
      <Card header="Confirmed">{confirmed}</Card>
      <Card header="Dead">{dead}</Card>
    </div>
  );
};

export default USATotal;
