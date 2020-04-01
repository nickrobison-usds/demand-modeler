import React from "react";
import {AppContext, State} from "../app/AppStore";
import {StateMixedBar} from "../components/Charts/StateMixedBar";
import {Top10Counties} from "../components/Charts/Top10Counties";
import {StateBar} from "../components/Charts/StateBar";
import {MixedBar} from "../components/Charts/MixedBar";
// import CountyMap from "../components/Maps/CountyMap";
import "./Report.scss";
import {dateTimeString} from "../utils/DateUtils";
import {ReportContainer} from "../components/ReportContainer";

export const Report: React.FC<{}> = () => {
  const pagebreak = (lastUpdated: Date | undefined) => {
    return (
      <div style={{margin: "20px 0", fontSize: "13px"}}>
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
           12 states with highest case count as of 3/17 shown.
        </div>
        <div>
          Data sourced from state health department websites; reporting may be
          incomplete or delayed. Death data is inconsistent and delayed in reporting
        </div>
        <div className="pagebreak"/>
      </div>
    );
  };

  const maps = (lastUpdated: any) => {
    return null;
    // return (
    //   <>
    //     <CountyMap
    //       reportView
    //       dataType={"Total"}
    //       title={"Total Confirmed Cases"}
    //     />
    //     {lastUpdated && pagebreak(lastUpdated)}
    //     <CountyMap
    //       reportView
    //       dataType={"Total"}
    //       title={"Total Confirmed Cases near NYC"}
    //       presetCoordinates="New York Area"
    //     />
    //     {lastUpdated && pagebreak(lastUpdated)}
    //     <CountyMap
    //       reportView
    //       dataType={"Total"}
    //       title={"Total Confirmed Cases in Southern California"}
    //       presetCoordinates="Southern California"
    //     />
    //     {lastUpdated && pagebreak(lastUpdated)}
    //     <CountyMap
    //       reportView
    //       dataType={"Total"}
    //       title={"Total Confirmed Cases near Washington State"}
    //       presetCoordinates="Washington State"
    //     />
    //     {lastUpdated && pagebreak(lastUpdated)}
    //     <CountyMap
    //       reportView
    //       dataType={"Total"}
    //       title={"Total Confirmed Cases near Atlanta Area"}
    //       presetCoordinates="Atlanta Area"
    //     />
    //     {lastUpdated && pagebreak(lastUpdated)}
    //     <CountyMap
    //       reportView
    //       dataType={"Total"}
    //       title={"Total Confirmed Cases near New Orleans Area"}
    //       presetCoordinates="New Orleans Area"
    //     />
    //     {lastUpdated && pagebreak(lastUpdated)}
    //     <CountyMap
    //       reportView
    //       dataType={"Total"}
    //       title={"Total Confirmed Cases near Miami Area"}
    //       presetCoordinates="Miami Area"
    //     />
    //     {lastUpdated && pagebreak(lastUpdated)}

    //     <CountyMap
    //       reportView
    //       dataType={"New"}
    //       title={"Percent Increase for Counties with 20+ reported cases"}
    //     />
    //     {lastUpdated && pagebreak(lastUpdated)}
    //     <CountyMap
    //       reportView
    //       dataType={"New"}
    //       title={
    //         "Percent Increase for Counties with 20+ reported cases near NYC"
    //       }
    //       presetCoordinates="New York Area"
    //     />
    //     {lastUpdated && pagebreak(lastUpdated)}
    //     <CountyMap
    //       reportView
    //       dataType={"New"}
    //       title={
    //         "Percent Increase for Counties with 20+ reported cases in Southern California"
    //       }
    //       presetCoordinates="Southern California"
    //     />
    //     {lastUpdated && pagebreak(lastUpdated)}
    //     <CountyMap
    //       reportView
    //       dataType={"New"}
    //       title={
    //         "Percent Increase for Counties with 20+ reported cases near Washington State"
    //       }
    //       presetCoordinates="Washington State"
    //     />
    //     {lastUpdated && pagebreak(lastUpdated)}
    //     <CountyMap
    //       reportView
    //       dataType={"New"}
    //       title={
    //         "Percent Increase for Counties with 20+ reported cases near the Atlanta Area"
    //       }
    //       presetCoordinates="Atlanta Area"
    //     />
    //     {lastUpdated && pagebreak(lastUpdated)}
    //     <CountyMap
    //       reportView
    //       dataType={"New"}
    //       title={
    //         "Percent Increase for Counties with 20+ reported cases near the New Orleans Area"
    //       }
    //       presetCoordinates="New Orleans Area"
    //     />
    //     {lastUpdated && pagebreak(lastUpdated)}
    //     <CountyMap
    //       reportView
    //       dataType={"New"}
    //       title={
    //         "Percent Increase for Counties with 20+ reported cases near the Miami Area"
    //       }
    //       presetCoordinates="Miami Area"
    //     />
    //     {lastUpdated && pagebreak(lastUpdated)}
    //   </>
    // );
  };

  return (
    <AppContext.Consumer>
      {({state}) => {
        let lastUpdated: Date | undefined = undefined;
        Object.values(state.lastWeekCovidTimeSeries.states)
          .flat()
          .forEach(({Reported}) => {
            if (!lastUpdated || Reported > lastUpdated) {
              lastUpdated = Reported;
            }
          });

        const states = Object.keys(state.lastWeekCovidTimeSeries.states).flatMap(
          k => state.lastWeekCovidTimeSeries.states[k]
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
        console.log(top10States);

        return (
          <ReportContainer
            states={top10States}
            weeklyTimeSeries={state.lastWeekCovidTimeSeries}
            historicalTimeSeries={state.historicalCovidTimeSeries}
          >
            <div className="report grid-container" style={{marginLeft: 0}}>
              {maps(lastUpdated)}
              {top10States.map(s => (
                <>
                  <StateBar
                    dataMode="over20Cases"
                    state={s.ID}
                    timeSeries={state.lastWeekCovidTimeSeries}
                    stat="confirmed"
                    stateCount={false}
                    reportView
                    meta={state.lastWeekCovidTimeSeries.graphMetaData}
                  />
                  {lastUpdated && pagebreak(lastUpdated)}
                  <StateBar
                    dataMode="over20Cases"
                    state={s.ID}
                    timeSeries={state.lastWeekCovidTimeSeries}
                    stat="confirmed"
                    stateCount={false}
                    reportView
                    meta={state.lastWeekCovidTimeSeries.graphMetaData}
                    new={true}
                  />
                  {lastUpdated && pagebreak(lastUpdated)}
                  <StateBar
                    dataMode="top10"
                    state={s.ID}
                    timeSeries={state.lastWeekCovidTimeSeries}
                    stat="dead"
                    stateCount={false}
                    reportView
                    meta={state.lastWeekCovidTimeSeries.graphMetaData}
                  />
                  {lastUpdated && pagebreak(lastUpdated)}
                  <StateBar
                    dataMode="top10"
                    state={s.ID}
                    timeSeries={state.lastWeekCovidTimeSeries}
                    stat="dead"
                    stateCount={false}
                    reportView
                    meta={state.lastWeekCovidTimeSeries.graphMetaData}
                    new={true}
                  />
                  {lastUpdated && pagebreak(lastUpdated)}
                </>
              ))}
              <Top10Counties
                timeSeries={state.lastWeekCovidTimeSeries}
                stat="confirmed"
                reportView
                meta={state.lastWeekCovidTimeSeries.graphMetaData}
              />
              {pagebreak(lastUpdated)}
              <Top10Counties
                timeSeries={state.lastWeekCovidTimeSeries}
                stat="confirmed"
                reportView
                meta={state.lastWeekCovidTimeSeries.graphMetaData}
                new={true}
              />
              {pagebreak(lastUpdated)}
              <Top10Counties
                timeSeries={state.lastWeekCovidTimeSeries}
                stat="dead"
                reportView
                meta={state.lastWeekCovidTimeSeries.graphMetaData}
              />
              {pagebreak(lastUpdated)}
              <Top10Counties
                timeSeries={state.lastWeekCovidTimeSeries}
                stat="dead"
                reportView
                meta={state.lastWeekCovidTimeSeries.graphMetaData}
                new={true}
              />
              {pagebreak(lastUpdated)}
              <Top10Counties
                timeSeries={state.lastWeekCovidTimeSeries}
                stat="mortalityRate"
                reportView
                meta={state.lastWeekCovidTimeSeries.graphMetaData}
              />
              {pagebreak(lastUpdated)}
              <Top10Counties
                timeSeries={state.lastWeekCovidTimeSeries}
                stat="mortalityRate"
                reportView
                meta={state.lastWeekCovidTimeSeries.graphMetaData}
                new={true}
              />
              {pagebreak(lastUpdated)}
              <StateMixedBar
                state={undefined}
                county={undefined}
                timeSeries={state.lastWeekCovidTimeSeries}
                stat="confirmed"
                stateCount={true}
                reportView
                meta={state.lastWeekCovidTimeSeries.graphMetaData}
              />
              {lastUpdated && pagebreak(lastUpdated)}
              <StateMixedBar
                state={undefined}
                county={undefined}
                timeSeries={state.lastWeekCovidTimeSeries}
                stat="dead"
                stateCount={true}
                reportView
                meta={state.lastWeekCovidTimeSeries.graphMetaData}
              />
              {lastUpdated && pagebreak(lastUpdated)}
              <MixedBar
                state={undefined}
                county={undefined}
                timeSeries={state.lastWeekCovidTimeSeries}
                stat="confirmed"
                reportView
              />
              {lastUpdated && pagebreak(lastUpdated)}
              <MixedBar
                state={undefined}
                county={undefined}
                timeSeries={state.lastWeekCovidTimeSeries}
                stat="dead"
                reportView
              />
              {lastUpdated && pagebreak(lastUpdated)}
            </div>
          </ReportContainer>
        );
       }}
    </AppContext.Consumer>
  );
};
