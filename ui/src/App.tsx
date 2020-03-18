import React from "react";
import "./App.scss";
import { AppStoreProvider } from "./app/AppStore";
import EpiMap from "./components/EpiMap";
import Card from "./components/Card/Card";
import USATotals from "./components/USATotals";
import StateSelect from "./components/Forms/StateSelect";
import CountySelect from "./components/Forms/CountySelect";
import { ChartContainer } from "./components/Charts/ChartContainer";
import { ChartContainer2 } from "./components/Charts/ChartContainer2";
import { ApiContainer } from "./components/ApiContainer";

function App() {
  return (
    <AppStoreProvider>
      <ApiContainer>
        <Card>
          <div style={{ display: "flex" }}>
            <StateSelect />
            <CountySelect />
          </div>
        </Card>
        <div style={{ display: "flex" }}>
          <Card header="Confirmed">
            <EpiMap stat="confirmed" />
            <USATotals stat="confirmed" />
            <ChartContainer2 stat="confirmed" />
            <ChartContainer stat="confirmed" stateCount={true} />
            <ChartContainer stat="confirmed" stateCount={false} />
          </Card>
          <Card header="Dead">
            <EpiMap stat="dead" />
            <USATotals stat="dead" />
            <ChartContainer2 stat="dead" />
            <ChartContainer stat="dead" stateCount={true} />
            <ChartContainer stat="dead" stateCount={false} />
          </Card>
        </div>
        <div></div>
      </ApiContainer>
    </AppStoreProvider>
  );
}

export default App;
