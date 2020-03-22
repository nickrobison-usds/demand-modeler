import React from "react";
import { AppContext, State } from "../app/AppStore";
import { StateMixedBar } from "../components/Charts/StateMixedBar";
import { Top10Counties } from "../components/Charts/Top10Counties";
import { StateBar } from "../components/Charts/StateBar";
import { MixedBar } from "../components/Charts/MixedBar";
import CountyMap from "../components/Maps/CountyMap";
import "./Report.scss";
import { dateTimeString } from "../utils/DateUtils";
import { CountyTrendGraph } from "../components/Charts/CountyTrendGraph";

export const Report: React.FC<{}> = () => {
  const pagebreak = (lastUpdated: Date | undefined) => {
    return (
      <div style={{ margin: "20px 0", fontSize: "13px" }}>
        <div>
          Source:{" "}
          <a
            href="https://www.csbs.org/information-covid-19-coronavirus"
            target="_blank"
            rel="noopener noreferrer"
          >
            Conference of State Bank Supervisors
          </a>
          , as of {lastUpdated && dateTimeString(lastUpdated)}.
          {/* 12 states with highest case count as of 3/17 shown. */}
        </div>
        <div>
          Data sourced from state health department websites; reporting may be
          incomplete or delayed
        </div>
        <div className="pagebreak" />
      </div>
    );
  };

  return (
    <AppContext.Consumer>
      {({ state }) => {
        let lastUpdated: Date | undefined = undefined;
        Object.values(state.covidTimeSeries.states)
          .flat()
          .forEach(({ Reported }) => {
            if (!lastUpdated || Reported > lastUpdated) {
              lastUpdated = Reported;
            }
          });

        const states = Object.keys(state.covidTimeSeries.states).flatMap(
          k => state.covidTimeSeries.states[k]
        );
        const stateIDs = new Set();
        const dedupedStates: State[] = [];
        states.forEach(s => {
          const key = `${s.State}`;
          if (!stateIDs.has(key)) {
            dedupedStates.push(s);
            stateIDs.add(key);
          }
        });
        const top10States = [...dedupedStates]
          .sort((s1, s2) => s2.Confirmed - s1.Confirmed)
          .slice(0, 10);
        return (
          <div className="report grid-container" style={{ marginLeft: 0 }}>
            <CountyMap reportView />
            {lastUpdated && pagebreak(lastUpdated)}
            {top10States.map(s => (
              <>
                <StateBar
                  state={s.ID}
                  timeSeries={state.covidTimeSeries}
                  stat="confirmed"
                  stateCount={false}
                  reportView
                  meta={state.graphMetaData}
                />
                {lastUpdated && pagebreak(lastUpdated)}
              </>
            ))}
            <Top10Counties
              timeSeries={state.covidTimeSeries}
              stat="confirmed"
              reportView
              meta={state.graphMetaData}
            />
            {pagebreak(lastUpdated)}
            <StateMixedBar
              state={undefined}
              county={undefined}
              timeSeries={state.covidTimeSeries}
              stat="confirmed"
              stateCount={true}
              reportView
              meta={state.graphMetaData}
            />
            {lastUpdated && pagebreak(lastUpdated)}
            <MixedBar
              state={undefined}
              county={undefined}
              timeSeries={state.covidTimeSeries}
              stat="confirmed"
              reportView
            />
            {lastUpdated && pagebreak(lastUpdated)}
            <CountyTrendGraph
              timeSeries={state.covidTimeSeries}
              selection={state.selection}
            />
            {lastUpdated && pagebreak(lastUpdated)}
          </div>
        );
      }}
    </AppContext.Consumer>
  );
};
