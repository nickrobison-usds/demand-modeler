import React from "react";
import { AppContext } from "../../app/AppStore";
import { MixedBar } from "./MixedBar";

interface Props {
  stat: "confirmed" | "dead"
}

export const ChartContainer2: React.FC<Props> = (props) => {
  return (
    <AppContext.Consumer>
      {({ state }) => {
        return (
          <MixedBar
            state={state.selection.state}
            county={state.selection.county}
            timeSeries={state.covidTimeSeries}
            stat={props.stat}
          />
        );
      }}
    </AppContext.Consumer>
  );
};
