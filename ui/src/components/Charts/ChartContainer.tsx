import React from "react";
import { AppContext } from "../../app/AppStore";
import { StateMixedBar } from "./StateMixedBar";
import Card from "../Card/Card";

interface Props {
  stat: "confirmed" | "dead";
  stateCount: boolean;
}

export const ChartContainer: React.FC<Props> = props => {
  return (
    <AppContext.Consumer>
      {({ state }) => {
        return (
          <Card>
            <StateMixedBar
              state={state.selection.state}
              county={state.selection.county}
              timeSeries={state.covidTimeSeries}
              stat={props.stat}
              stateCount={props.stateCount}
            />
          </Card>
        );
      }}
    </AppContext.Consumer>
  );
};
