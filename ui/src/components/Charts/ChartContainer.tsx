import React from "react";
import { AppContext } from "../../app/AppStore";
import { StateMixedBar } from "./StateMixedBar";
import Card from "../Card/Card";

export const ChartContainer: React.FC = () => {
  return (
    <AppContext.Consumer>
      {({ state }) => {
        console.log(state);
        return (
          state.selection.state && (
            <Card>
              <StateMixedBar
                state={state.selection.state}
                timeSeries={state.covidTimeSeries}
              />
            </Card>
          )
        );
      }}
    </AppContext.Consumer>
  );
};
