import React from "react";
import { AppContext } from "../app/AppStore";
import CountyMap from "../components/Maps/CountyMap";
import Card from "../components/Card/Card";
import USATotals from "../components/USATotals";
import StateSelect from "../components/Forms/StateSelect";
import CountySelect from "../components/Forms/CountySelect";
import { MixedBar } from "../components/Charts/MixedBar";
import { StateMixedBar } from "../components/Charts/StateMixedBar";
import { useResizeToContainer } from "../utils/useResizeToContainer";
import { CountyTrendGraph } from "../components/Charts/CountyTrendGraph";

export const Dashboard: React.FC<{}> = () => {
  const chartWidth = useResizeToContainer("#charts");

  return (
    <AppContext.Consumer>
      {({ state }) => {
        return (
          <div>
            <Card>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexFlow: "row wrap"
                }}
              >
                <div style={{ display: "flex" }}>
                  <StateSelect />
                  <CountySelect />
                </div>
                <a
                  className="uas-button"
                  href="?report=true"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Report
                </a>
              </div>
            </Card>
            <div
              className="dashboard"
              style={{
                display: "flex",
                flexDirection: "column",
                margin: "auto",
                flexFlow: "row wrap",
                width: "100%"
              }}
            >
              <div style={{ width: "35%" }}>
                <Card>
                  <CountyMap />
                  <div style={{ width: "100%" }}>
                    <USATotals />
                  </div>
                </Card>
              </div>
              <div
                style={{
                  width: "65%",
                  display: "flex",
                  flexDirection: "column",
                  flexFlow: "row wrap"
                }}
              >
                <div style={{ width: "50%" }}>
                  <Card>
                    <MixedBar
                      state={state.selection.state}
                      county={state.selection.county}
                      timeSeries={state.covidTimeSeries}
                      stat="confirmed"
                      chartWidth={chartWidth}
                    />
                  </Card>
                </div>
                <div style={{ width: "50%" }}>
                  <Card>
                    <StateMixedBar
                      state={state.selection.state}
                      county={state.selection.county}
                      timeSeries={state.covidTimeSeries}
                      stat="confirmed"
                      stateCount={true}
                      meta={state.graphMetaData}
                      chartWidth={chartWidth}
                    />
                  </Card>
                </div>
                <div style={{ width: "50%" }}>
                  <Card>
                    <StateMixedBar
                      state={state.selection.state}
                      county={state.selection.county}
                      timeSeries={state.covidTimeSeries}
                      stat="confirmed"
                      stateCount={false}
                      meta={state.graphMetaData}
                      chartWidth={chartWidth}
                    />
                  </Card>
                </div>
              </div>
              <div style={{ margin: "0 1em" }} id="charts">
                <CountyTrendGraph
                  timeSeries={state.covidTimeSeries}
                  chartWidth={chartWidth}
                  selection={state.selection}
                />
              </div>
            </div>
          </div>
        );
      }}
    </AppContext.Consumer>
  );
};
