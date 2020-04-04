import React from "react";
import { AppContext } from "../app/AppStore";
import CountyMap from "../components/Maps/CountyMap";
import Card from "../components/Card/Card";
import USATotalsAlt from "../components/USATotalsAlt";
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
          <div>
            <div className="dashboard-nav">
              <div className="grid-row grid-gap">
                <div
                  className="tablet:grid-col-10 mobile:col-12"
                  style={{ display: "flex" }}
                >
                  <MetricSelect />
                  <StateSelect />
                  <CountySelect />
                </div>
                <div className="tablet:grid-col-2 mobile:col-12">
                  <a
                    className="usa-button usa-button--outline report-button"
                    href="?report=true"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View report
                  </a>
                </div>
              </div>
            </div>
            <div className="dashboard grid-row grid-gap">
              <div className="dashboard-map desktop:grid-col-4 tablet:col-12">
                <div>
                  <USATotalsAlt />
                  <div>
                    <CountyMap />
                  </div>
                </div>
              </div>
              <div className="dashboard-scroll desktop:grid-col-8 tablet:col-12">
                <div className="grid-row grid-gap">
                  <Card>
                    <MixedBar
                      state={state.selection.state}
                      county={state.selection.county}
                      timeSeries={state.lastWeekCovidTimeSeries}
                      stat={state.selection.metric}
                      chartWidth={chartWidth}
                    />
                  </Card>
                  {!state.selection.state && (
                    <Card>
                      <StateMixedBar
                        state={state.selection.state}
                        county={state.selection.county}
                        timeSeries={state.lastWeekCovidTimeSeries}
                        stat={state.selection.metric}
                        stateCount={true}
                        meta={state.lastWeekCovidTimeSeries.graphMetaData}
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
                          timeSeries={state.lastWeekCovidTimeSeries}
                          stat={state.selection.metric}
                          stateCount={false}
                          meta={state.lastWeekCovidTimeSeries.graphMetaData}
                          chartWidth={chartWidth}
                        />
                      </Card>
                      <Card>
                        <CountyTrendGraph
                          timeSeries={state.lastWeekCovidTimeSeries}
                          chartWidth={chartWidth}
                          selection={state.selection}
                        />
                      </Card>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </AppContext.Consumer>
  );
};
