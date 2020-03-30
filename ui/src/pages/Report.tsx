import React from "react";
import { AppContext, State } from "../app/AppStore";
import { StateMixedBar } from "../components/Charts/StateMixedBar";
import { Top10Counties } from "../components/Charts/Top10Counties";
import { StateBar } from "../components/Charts/StateBar";
import { MixedBar } from "../components/Charts/MixedBar";
import CountyMap, {
  CoorinateKey,
  EXCLUDE_PERCENT_INCREASE_CASES_BELOW
} from "../components/Maps/CountyMap";
import "./Report.scss";
import { dateTimeString } from "../utils/DateUtils";
import {  getLastUpdated, getMostRecentStateUpdates } from "../utils/utils";

export const PageBreak: React.FC<{ lastUpdated: Date | undefined }> = ({
  lastUpdated
}) => {
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
      </div>
      <div>
        Data sourced from state health department websites; reporting may be
        incomplete or delayed. Death data is inconsistent and delayed in
        reporting
      </div>
      <div className="pagebreak" />
    </div>
  );
};

export const Report: React.FC<{}> = () => {
  const maps = (lastUpdated: any) => {
    const dateTypes: DataType[] = ["Total", "New"];
    const presetCoordinates: (CoorinateKey | undefined)[] = [
      undefined,
      "NYC",
      "Southern California",
      "Washington State",
      "Atlanta Area",
      "New Orleans Area",
      "Miami Area"
    ];
    const mapTitle = (dataType: DataType, coordinateKey: CoorinateKey | undefined) => {
      let title = dataType === "Total"
        ? "Total Confirmed Cases"
        : `Percent Increase for Counties with ${EXCLUDE_PERCENT_INCREASE_CASES_BELOW}+ reported cases`;
      if (coordinateKey) {
        title += `Near ${coordinateKey}`;
      }
      return title;
    };
    return (
      <>
        {presetCoordinates.map(coordinateKey => {
          return dateTypes.map(dataType => (
            <>
              <CountyMap
                reportView
                dataType={dataType}
                title={mapTitle(dataType, coordinateKey)}
                presetCoordinates={coordinateKey}
              />
              <PageBreak lastUpdated={lastUpdated} />
            </>
          ));
        })}
      </>
    );
  };

  return (
    <AppContext.Consumer>
      {({ state }) => {
        const lastUpdated: Date | undefined = getLastUpdated(state.covidTimeSeries);
        const states = getMostRecentStateUpdates(state.covidTimeSeries);

        // const stateIDs = new Set();
        // const dedupedStates: State[] = [];
        // states.forEach(s => {
        //   const key = `${s.State}`;
        //   if (!stateIDs.has(key)) {
        //     dedupedStates.push(s);
        //     stateIDs.add(key);
        //   }
        // });
        // console.log(states, "yo")
        // const top10States = [...dedupedStates]
        //   .filter(s =>
        //     [
        //       "New York",
        //       "New Jersey",
        //       "Washington",
        //       "California",
        //       "Michigan",
        //       "Illinois",
        //       "Florida",
        //       "Louisiana",
        //       "Massachusetts",
        //       "Texas"
        //     ].includes(s.State)
        //   )
        //   .sort((s1, s2) => s2.Confirmed - s1.Confirmed);
        // // .slice(0, 10);
        // console.log(top10States);

        return (
          <div className="report grid-container" style={{ marginLeft: 0 }}>
            {/* {maps(lastUpdated)}
            <Top10Counties
              timeSeries={state.covidTimeSeries}
              stat="confirmed"
              reportView
              meta={state.graphMetaData}
            />
            <PageBreak lastUpdated={lastUpdated} />
            <Top10Counties
              timeSeries={state.covidTimeSeries}
              stat="confirmed"
              reportView
              meta={state.graphMetaData}
              new={true}
            />
            <PageBreak lastUpdated={lastUpdated} />
            <Top10Counties
              timeSeries={state.covidTimeSeries}
              stat="dead"
              reportView
              meta={state.graphMetaData}
            />
            <PageBreak lastUpdated={lastUpdated} />
            <Top10Counties
              timeSeries={state.covidTimeSeries}
              stat="dead"
              reportView
              meta={state.graphMetaData}
              new={true}
            />
            <PageBreak lastUpdated={lastUpdated} />
            <StateMixedBar
              state={undefined}
              county={undefined}
              timeSeries={state.covidTimeSeries}
              stat="confirmed"
              stateCount={true}
              reportView
              meta={state.graphMetaData}
            />
            <PageBreak lastUpdated={lastUpdated} />
            <StateMixedBar
              state={undefined}
              county={undefined}
              timeSeries={state.covidTimeSeries}
              stat="dead"
              stateCount={true}
              reportView
              meta={state.graphMetaData}
            />
            <PageBreak lastUpdated={lastUpdated} />
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
                <PageBreak lastUpdated={lastUpdated} />
                <StateBar
                  dataMode="over20Cases"
                  state={s.ID}
                  timeSeries={state.covidTimeSeries}
                  stat="confirmed"
                  stateCount={false}
                  reportView
                  meta={state.graphMetaData}
                  new={true}
                />
                <PageBreak lastUpdated={lastUpdated} />
                <StateBar
                  dataMode="top10"
                  state={s.ID}
                  timeSeries={state.covidTimeSeries}
                  stat="dead"
                  stateCount={false}
                  reportView
                  meta={state.graphMetaData}
                />
                <PageBreak lastUpdated={lastUpdated} />
                <StateBar
                  dataMode="top10"
                  state={s.ID}
                  timeSeries={state.covidTimeSeries}
                  stat="dead"
                  stateCount={false}
                  reportView
                  meta={state.graphMetaData}
                  new={true}
                />
                <PageBreak lastUpdated={lastUpdated} />
              </>
            ))}
            <MixedBar
              state={undefined}
              county={undefined}
              timeSeries={state.covidTimeSeries}
              stat="confirmed"
              reportView
            />
            <PageBreak lastUpdated={lastUpdated} />
            <MixedBar
              state={undefined}
              county={undefined}
              timeSeries={state.covidTimeSeries}
              stat="dead"
              reportView
            />
            <PageBreak lastUpdated={lastUpdated} /> */}
          </div>
        );
      }}
    </AppContext.Consumer>
  );
};
