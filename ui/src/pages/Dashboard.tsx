import React from "react";
import { AppContext } from "../app/AppStore";
import CountyMap from "../components/Maps/CountyMap";
import Card from "../components/Card/Card";
import USATotals from "../components/USATotals";
import USATotalsNav from "../components/USATotalsNav";
import StateSelect from "../components/Forms/StateSelect";
import CountySelect from "../components/Forms/CountySelect";
import { MetricSelect } from "../components/Forms/MetricSelect";
import { MixedBar } from "../components/Charts/MixedBar";
import { StackedArea } from "../components/Charts/StackedArea";
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
              <div className="nav-title">
                <strong className="margin-right-1">COVID-19 in the United States</strong>
                <span className="text-right font-sans-xs text-gray-40">Updated: [[03/23/20 04:59 PM EST]]</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div style={{ display: "flex" }}>
                  <MetricSelect />
                  <StateSelect />
                  <CountySelect />
                </div>
                <USATotalsNav />
                <a
                  className="usa-button"
                  href="?report=true"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Report
                </a>
            </div>
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
                  <StackedArea
                    state={state.selection.state}
                    county={state.selection.county}
                    timeSeries={state.covidTimeSeries}
                    stat="confirmed"
                    chartWidth={chartWidth}
                  />
                </Card>
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
