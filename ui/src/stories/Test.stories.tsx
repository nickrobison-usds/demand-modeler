import React from "react";
import { storiesOf } from "@storybook/react";
import { StateMixedBar } from "../components/Charts/StateMixedBar";
import { mockCovidTimeSeries } from "../app/mockData";
import { MixedBar } from "../components/Charts/MixedBar";
import { AppStoreProvider } from "../app/AppStore";
import USATotals from "../components/USATotals";

storiesOf("Charts", module)
  .add("Top 10 counties by state", () => {
    return (
      <StateMixedBar
        state={"1"}
        timeSeries={mockCovidTimeSeries}
        stat="confirmed"
        stateCount={false}
      />
    );
  })
  .add("Top 10 states", () => {
    return (
      <StateMixedBar
        timeSeries={mockCovidTimeSeries}
        stat="confirmed"
        stateCount={true}
      />
    );
  })
  .add("Top 10 counties", () => {
    return (
      <StateMixedBar
        timeSeries={mockCovidTimeSeries}
        stat="confirmed"
        stateCount={false}
      />
    );
  })
  .add("Grand total - All", () => {
    return <MixedBar timeSeries={mockCovidTimeSeries} stat="confirmed" />;
  })
  .add("Grand total - State", () => {
    return (
      <MixedBar state="3" timeSeries={mockCovidTimeSeries} stat="confirmed" />
    );
  })
  .add("Grand total - County", () => {
    return (
      <MixedBar
        county="3|3"
        timeSeries={mockCovidTimeSeries}
        stat="confirmed"
      />
    );
  });

storiesOf("USA Totals", module)
  .add("Stats, All", () => {
    return (
      <AppStoreProvider
        initialState={{
          covidTimeSeries: mockCovidTimeSeries,
          selection: { date: "2020-3-16", metric: "confirmed" },
          mapView: { width: 0, height: 0, latitude: 0, longitude: 0, zoom: 0 }
        }}
      >
        <USATotals />
      </AppStoreProvider>
    );
  })
  .add("Stats, State", () => {
    return (
      <AppStoreProvider
        initialState={{
          covidTimeSeries: mockCovidTimeSeries,
          selection: { date: "2020-3-15", state: "1", metric: "confirmed" },
          mapView: { width: 0, height: 0, latitude: 0, longitude: 0, zoom: 0 }
        }}
      >
        <USATotals />
      </AppStoreProvider>
    );
  })
  .add("Stats, County", () => {
    return (
      <AppStoreProvider
        initialState={{
          covidTimeSeries: mockCovidTimeSeries,
          selection: {
            date: "2020-3-15",
            state: "1",
            county: "1|1",
            metric: "confirmed"
          },
          mapView: { width: 0, height: 0, latitude: 0, longitude: 0, zoom: 0 }
        }}
      >
        <USATotals />
      </AppStoreProvider>
    );
  });
