import React from "react";
import { AppContext, State } from "../../app/AppStore";
import { StateMixedBar } from "./StateMixedBar";
import { MixedBar } from "./MixedBar";
import "./Report.scss";
import { formatDate, dateTimeString } from "../../utils/DateUtils";

export const Report: React.FC<{}> = () => {
  const LAST_UPDATED = new Date("22:00 March 17, 2020")

  const pagebreak = () => {
    return (
      <div style={{margin: "20px 0", fontSize:"13px"}}>
        <div>
          Source:{" "}
          <a
            href="https://www.csbs.org/information-covid-19-coronavirus"
            target="_blank"
            rel="noopener noreferrer"
          >
            Conference of State Bank Supervisors
          </a>
          , as of {dateTimeString(LAST_UPDATED)}.
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
        const states = Object.keys(state.covidTimeSeries.states).flatMap(k => state.covidTimeSeries.states[k]).filter(
          ({ Reported }) => formatDate(Reported) === state.selection.date
        );
        const stateIDs = new Set();
        const dedupedStates: State[] = [];
        states.forEach(s => {
          if (!stateIDs.has(s.ID)) {
            dedupedStates.push(s);
            stateIDs.add(s.ID);
          }
        });
          const top10States = [...dedupedStates]
          .sort((s1, s2) => s2.Confirmed - s1.Confirmed)
          .slice(0, 10);
        return (
          <div className="report grid-container" style={{marginLeft: 0}}>
            <div>
              <h1>COVID-19 county-level case data</h1>
              <p>Data as of 22:00 March 17, 2020</p>
              <div className="pagebreak" />
            </div>
            {top10States.map(s => (
              <>
                <StateMixedBar
                  state={s.ID}
                  county={undefined}
                  timeSeries={state.covidTimeSeries}
                  stat="confirmed"
                  stateCount={false}
                  reportView
                  meta={state.graphMetaData}
                />
                {pagebreak()}
              </>
            ))}
            <StateMixedBar
              state={undefined}
              county={undefined}
              timeSeries={state.covidTimeSeries}
              stat="confirmed"
              stateCount={false}
              reportView
              meta={state.graphMetaData}
            />
            {pagebreak()}
            <StateMixedBar
              state={undefined}
              county={undefined}
              timeSeries={state.covidTimeSeries}
              stat="confirmed"
              stateCount={true}
              reportView
              meta={state.graphMetaData}
            />
            {pagebreak()}
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
