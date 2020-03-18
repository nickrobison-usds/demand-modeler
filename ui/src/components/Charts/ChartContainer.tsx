import React from "react";
import { AppContext } from "../../app/AppStore";
import { StateMixedBar } from "./StateMixedBar";

export const ChartContainer: React.FC = () => {
  return (
    <AppContext.Consumer>
      {({ state }) => {
        console.log(state);
        return (
          state.selection.state && (
            <StateMixedBar
              state={state.selection.state}
              timeSeries={state.covidTimeSeries}
            />
          )
        );
      }}
    </AppContext.Consumer>
  );
};
