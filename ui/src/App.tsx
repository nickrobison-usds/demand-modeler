import React from "react";
import "./App.scss";
import { AppStoreProvider } from "./app/AppStore";
import CountyMap from "./components/Maps/CountyMap";
import Card from "./components/Card/Card";
import USATotals from "./components/USATotals";
import StateSelect from "./components/Forms/StateSelect";
import CountySelect from "./components/Forms/CountySelect";
import { ChartContainer } from "./components/Charts/ChartContainer";
import { ChartContainer2 } from "./components/Charts/ChartContainer2";
import { Report } from "./components/Charts/Report";
import { ApiContainer } from "./components/ApiContainer";

function App() {
  const url = new URL(window.location.href);
  const report = url.searchParams.get("report");
  if (report) {
    return (
      <AppStoreProvider>
        <ApiContainer>
          <Report />
        </ApiContainer>
      </AppStoreProvider>
    );
  } else {
    return (
      <AppStoreProvider>
        <ApiContainer>
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
          <CountyMap/>
          <USATotals/>
          <ChartContainer2 stat="confirmed" />
          <ChartContainer stat="confirmed" stateCount={true} />
          <ChartContainer stat="confirmed" stateCount={false} />
        </ApiContainer>
      </AppStoreProvider>
    );
  }
}

export default App;
