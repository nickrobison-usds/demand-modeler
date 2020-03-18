import React from "react";
import "./App.scss";
import Header from "./components/Header/Header";
import { AppStoreProvider } from "./app/AppStore";
import EpiMap from "./components/EpiMap";
import USATotals from "./components/USATotals";
import StateSelect from "./components/Forms/StateSelect";
import CountySelect from "./components/Forms/CountySelect";

function App() {
  return (
    <AppStoreProvider>
      <Header title="Demand Modeller" titleRoute="/" />
      <EpiMap />
      <StateSelect/>
      <CountySelect/>
      <USATotals />
    </AppStoreProvider>
  );
}

export default App;
