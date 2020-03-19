import React from "react";
import { AppContext } from "../../app/AppStore";
import { StateMixedBar } from "./StateMixedBar";
import { MixedBar } from "./MixedBar";
import "./Report.scss";
import { formatDate } from "../../utils/DateUtils";

export const Report: React.FC<{}> = () => {
  return (
    <AppContext.Consumer>
      {({ state }) => {
        const states = state.covidTimeSeries.states.filter(
          ({ Reported }) => formatDate(Reported) === state.selection.date
        );
        const top10States = [...states]
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
                  reportView
                />
                <div className="pagebreak" />
              </>
            ))}
            <StateMixedBar
              state={undefined}
              county={undefined}
              timeSeries={state.covidTimeSeries}
              stat="confirmed"
              stateCount={false}
              reportView
            />
            <div className="pagebreak" />
            <StateMixedBar
              state={undefined}
              county={undefined}
              timeSeries={state.covidTimeSeries}
              stat="confirmed"
              stateCount={true}
              reportView
            />
            <div className="pagebreak" />
            <MixedBar
              state={undefined}
              county={undefined}
              timeSeries={state.covidTimeSeries}
              stat="confirmed"
              reportView
            />
          </div>
        );
      }}
    </AppContext.Consumer>
  );
};
