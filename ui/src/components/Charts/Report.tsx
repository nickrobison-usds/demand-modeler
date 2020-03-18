import React from "react";
import { AppContext } from "../../app/AppStore";
import { StateMixedBar } from "./StateMixedBar";
import { MixedBar } from "./MixedBar";
import "./Report.scss";

export const Report: React.FC<{}> = props => {
  return (
    <AppContext.Consumer>
      {({ state }) => {
        const states = Object.values(
          state.covidTimeSeries[state.selection.date].states
        );
        const top10States = states
          .sort((s1, s2) => s2.Confirmed - s1.Confirmed)
          .slice(0, 10);
        return (
          <div className="report">
            {top10States.map(s => (
              <>
              <StateMixedBar
                state={s.ID}
                county={undefined}
                timeSeries={state.covidTimeSeries}
                stat="confirmed"
                stateCount={false}
              />
              <div className="pagebreak"/>
              </>
            ))}
            <StateMixedBar
              state={undefined}
              county={undefined}
              timeSeries={state.covidTimeSeries}
              stat="confirmed"
              stateCount={false}
            />
            <div className="pagebreak"/>
            <StateMixedBar
              state={undefined}
              county={undefined}
              timeSeries={state.covidTimeSeries}
              stat="confirmed"
              stateCount={true}
            />
            <div className="pagebreak"/>
            <MixedBar
              state={undefined}
              county={undefined}
              timeSeries={state.covidTimeSeries}
              stat="confirmed"
            />
          </div>
        );
      }}
    </AppContext.Consumer>
  );
};
