import React, { useContext } from "react";
import Card from "./Card/Card";
import { AppContext, Case } from "../app/AppStore";

const USATotal: React.FunctionComponent<{}> = props => {
  const { state } = useContext(AppContext);

  let confirmed = 0;
  let dead = 0;
  state.cases.forEach((c: Case) => {
    confirmed += c.Confirmed;
    dead += c.Dead;
  });
  return (
    <div style={{display: "flex", textAlign: "center"}}>
      <Card header="Confirmed">{confirmed}</Card>
      <Card header="Dead">{dead}</Card>
    </div>

  );
};

export default USATotal;
