import React from "react";
import "./App.scss";
import Header from "./components/Header/Header";
import { AppStoreProvider } from "./app/AppStore";
import EpiMap from "./components/EpiMap";

function App() {
  return (
    <AppStoreProvider>
      <Header title="Demand Modeller" titleRoute="/" />
      <EpiMap />
    </AppStoreProvider>
  );
}

export default App;
