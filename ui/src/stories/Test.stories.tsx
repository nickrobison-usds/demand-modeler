import React from "react";
import { storiesOf } from "@storybook/react";
import { StateMixedBar } from "../components/Charts/StateMixedBar";
import { mockCovidTimeSeries } from "../app/mockData";

storiesOf("Charts", module)
  .add("Top 10 counties by state", () => {
    return (
      <StateMixedBar
        state={"Arizona"}
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
  });
