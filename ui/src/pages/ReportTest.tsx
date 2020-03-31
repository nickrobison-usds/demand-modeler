import React from "react";
import { AppContext, State } from "../app/AppStore";
import { StateMixedBar } from "../components/Charts/StateMixedBar";
import { Top10Counties } from "../components/Charts/Top10Counties";
import { StateBar } from "../components/Charts/StateBar";
import { MixedBar } from "../components/Charts/MixedBar";
import CountyMap from "../components/Maps/CountyMap";
import "./Report.scss";
import { dateTimeString } from "../utils/DateUtils";

export const ReportTest: React.FC<{}> = () => {
  const pagebreak = (lastUpdated: Date | undefined) => {
    return (
      <div style={{ margin: "20px 0" }}>
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
          incomplete or delayed. Death data is inconsistent and delayed in reporting
        </div>
        <div className="pagebreak" />
      </div>
    );
  };

  const maps = (lastUpdated: any) => {
    return (
      <>
        <CountyMap
          reportView
          dataType={"Total"}
          title={"Total Confirmed Cases"}
        />
        {lastUpdated && pagebreak(lastUpdated)}
        <CountyMap
          reportView
          dataType={"Total"}
          title={"Total Confirmed Cases near NYC"}
          presetCoordinates="New York Area"
        />
        {lastUpdated && pagebreak(lastUpdated)}
      </>
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
        const top10States = [...dedupedStates].filter((s) => ["New York", "New Jersey", "Washington", "California", "Michigan", "Illinois", "Florida", "Louisiana", "Massachusetts", "Texas"].includes(s.State))
            .sort((s1, s2) => s2.Confirmed - s1.Confirmed)
          // .slice(0, 10);
          console.log(top10States)

          return (
          <div className="report">
            <div className="reportScreenHeader grid-row">
              <div className="grid-col-6">
                <h1>Report</h1>
              </div>
              <div className="grid-col-6">
                <button
                  className="usa-button usa-button--outline"
                  onClick= { () => window.print() }
                >
                  Print
                </button>
              </div>
            </div>
            {maps(lastUpdated)}
            {top10States.map(s => (
              <>
                <StateBar
                  dataMode="over20Cases"
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
            {lastUpdated && pagebreak(lastUpdated)}
          </div>
        );
      }}
    </AppContext.Consumer>
  );
};
