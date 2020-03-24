import React from "react";
import { AppContext } from "../app/AppStore";
import CountyMap from "../components/Maps/CountyMap";
import Card from "../components/Card/Card";
import USATotals from "../components/USATotals";
import StateSelect from "../components/Forms/StateSelect";
import CountySelect from "../components/Forms/CountySelect";
import { MetricSelect } from "../components/Forms/MetricSelect";
import { MixedBar } from "../components/Charts/MixedBar";
import { StateMixedBar } from "../components/Charts/StateMixedBar";
import { useResizeToContainer } from "../utils/useResizeToContainer";
import { CountyTrendGraph } from "../components/Charts/CountyTrendGraph";
import "./Dashboard.scss";

export const Dashboard: React.FC<{}> = () => {
  const chartWidth = useResizeToContainer("#charts");

  return (
    <AppContext.Consumer>
      {({ state }) => {
        return (
          <div className="dashboard-container">
            <div className="dashboard-nav">
              <Card>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <div style={{ display: "flex" }}>
                    <StateSelect />
                    <CountySelect />
                    <MetricSelect />
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
            </div>
            <div className="dashboard">
              <div>
                <Card>
                  <div>
                    <CountyMap />
                  </div>
                  <div style={{ marginTop: "20px" }}>
                    <USATotals />
                  </div>
                </Card>
              </div>
              <div className="dashboard-scroll">
                <Card>
                  <MixedBar
                    state={state.selection.state}
                    county={state.selection.county}
                    timeSeries={state.covidTimeSeries}
                    stat={state.selection.metric}
                    chartWidth={chartWidth}
                  />
                </Card>
                {!state.selection.state && (
                  <Card>
                    <StateMixedBar
                      state={state.selection.state}
                      county={state.selection.county}
                      timeSeries={state.covidTimeSeries}
                      stat={state.selection.metric}
                      stateCount={true}
                      meta={state.graphMetaData}
                      chartWidth={chartWidth}
                    />
                  </Card>
                )}
                {!state.selection.county && (
                  <>
                    <Card>
                      <StateMixedBar
                        state={state.selection.state}
                        county={state.selection.county}
                        timeSeries={state.covidTimeSeries}
                        stat={state.selection.metric}
                        stateCount={false}
                        meta={state.graphMetaData}
                        chartWidth={chartWidth}
                      />
                    </Card>
                    <Card>
                      <CountyTrendGraph
                        timeSeries={state.covidTimeSeries}
                        chartWidth={chartWidth}
                        selection={state.selection}
                      />
                    </Card>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      }}
    </AppContext.Consumer>
  );
};
