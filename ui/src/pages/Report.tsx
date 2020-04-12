import React from "react";
import { AppContext, State } from "../app/AppStore";
// import { StateMixedBar } from "../components/Charts/StateMixedBar";
// import { Top10Counties } from "../components/Charts/Top10Counties";
// import { StateBar } from "../components/Charts/StateBar";
// import { MixedBar } from "../components/Charts/MixedBar";
// import CBSAMap from "../components/Maps/CBSAMap";
import "./Report.scss";
// import { dateTimeString } from "../utils/DateUtils";
import * as fips from "../utils/fips";
import { ReportContainer } from "../components/ReportContainer";
import { getDataIssues } from "../app/dataValidation";

export const Report: React.FC<{}> = () => {
  // const pagebreak = (lastUpdated: Date | undefined) => {
  //   return (
  //     <div style={{ margin: "20px 0", fontSize: "13px" }}>
  //       <div>
  //         Source:{" "}
  //         <a
  //           href="https://www.csbs.org/information-covid-19-coronavirus"
  //           target="_blank"
  //           rel="noopener noreferrer"
  //         >
  //           Conference of State Bank Supervisors
  //         </a>
  //         , as of {lastUpdated && dateTimeString(lastUpdated)}. 12 states with
  //         highest case count as of 3/17 shown.
  //       </div>
  //       <div>
  //         Data sourced from state health department websites; reporting may be
  //         incomplete or delayed. Death data is inconsistent and delayed in
  //         reporting
  //       </div>
  //       <div className="pagebreak" />
  //     </div>
  //   );
  // };

  // const maps = (lastUpdated: any) => {
  //   return (
  //     <>
  //       <CBSAMap dataType={"Total"} title={"Confirmed Cases"} />
  //       {lastUpdated && pagebreak(lastUpdated)}
  //     </>
  //   );
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
  // };


  const csvURI = (result: RuleResult) => {
    const csvHeader = "data:text/csv;charset=utf-8,";
    const header = result.headers.join(",") + "\n"
    const rows = result.issues.map(i => i.join(",")).join("\n")
    return encodeURI(csvHeader + header + rows);
  }

  return (
    <AppContext.Consumer>
      {({ state }) => {
        const dataIssues = getDataIssues(state.historicalCovidTimeSeries);

        let lastUpdated: Date | undefined = undefined;
        Object.values(state.lastWeekCovidTimeSeries.states)
          .flat()
          .forEach(({ Reported }) => {
            if (!lastUpdated || Reported > lastUpdated) {
              lastUpdated = Reported;
            }
          });

        const states = Object.keys(
          state.lastWeekCovidTimeSeries.states
        ).flatMap(k => state.lastWeekCovidTimeSeries.states[k]);
        const stateIDs = new Set();
        const dedupedStates: State[] = [];
        states.forEach(s => {
          const key = `${fips.getStateName(s.ID)}`;
          if (!stateIDs.has(key)) {
            dedupedStates.push(s);
            stateIDs.add(key);
          }
        });
        const top10States = [...dedupedStates]
          .filter(s => ["Texas"].includes(fips.getStateName(s.ID)))
          .sort((s1, s2) => s2.Confirmed - s1.Confirmed);
        // .slice(0, 10);

        return (
          <ReportContainer
            states={top10States}
            weeklyTimeSeries={state.lastWeekCovidTimeSeries}
            historicalTimeSeries={state.historicalCovidTimeSeries}
          >
            <div className="report grid-container" style={{ marginLeft: 0 }}>
              {dataIssues.length > 0 && (
                <>
                  <h1>Data Checks</h1>
                  {dataIssues.map((result, i) => {
                    return (
                      <div className="usa-accordion">
                        <h4 className="usa-accordion__heading">
                          <button
                            className="usa-accordion__button"
                            aria-expanded="false"
                            aria-controls={`a${i}`}
                          >
                            {result.rule} ({result.total})
                          </button>
                        </h4>
                        <div
                          id={`a${i}`}
                          className="usa-accordion__content usa-prose"
                          hidden
                        >
                          <a
                            href={csvURI(result)}
                            download={result.rule.split(" ").join("-") + ".csv"}
                          >
                            Export as csv
                          </a>
                          <table className="usa-table">
                            <thead>
                              {result.headers.map((h, i) => (
                                <th>{h}</th>
                              ))}
                            </thead>
                            <tbody>
                              {result.issues.map(row => (
                                <tr>
                                  {row.map(c => (
                                    <td>{c}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              {/* {maps(lastUpdated)}
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
              ))} */}
              {/*<Top10Counties
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
              {lastUpdated && pagebreak(lastUpdated)} */}
            </div>
          </ReportContainer>
        );
      }}
    </AppContext.Consumer>
  );
};
