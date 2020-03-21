import React from "react";
import "./App.scss";
import { AppStoreProvider } from "./app/AppStore";
import { Report } from "./pages/Report";
import { ApiContainer } from "./components/ApiContainer";
import { Dashboard } from "./pages/Dashboard";

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
          <Dashboard />
        </ApiContainer>
      </AppStoreProvider>
    );
  }
}

export default App;
