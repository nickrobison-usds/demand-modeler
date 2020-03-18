import React from "react";
import { storiesOf } from "@storybook/react";
import { StateMixedBar } from "../components/Charts/StateMixedBar";
import { CountyStat } from "../components/Charts/StateMixedBar";

storiesOf("Charts", module).add("State - Mixed Bar", () => {
  const countyStats: CountyStat[] = [
    {
      Name: "Westchester",
      data: {
        "14-Mar": 11,
        "15-Mar": 22,
        "16-Mar": 33,
        "17-Mar": 44
      }
    },
    {
      Name: "New York",
      data: {
        "14-Mar": 111,
        "15-Mar": 222,
        "16-Mar": 333,
        "17-Mar": 444
      }
    },
    {
      Name: "Nassau",
      data: {
        "14-Mar": 44,
        "15-Mar": 66,
        "16-Mar": 88,
        "17-Mar": 122
      }
    },
    {
      Name: "Suffolk",
      data: {
        "14-Mar": 44,
        "15-Mar": 66,
        "16-Mar": 88,
        "17-Mar": 122
      }
    },
    {
      Name: "Albany",
      data: {
        "14-Mar": 4,
        "15-Mar": 6,
        "16-Mar": 8,
        "17-Mar": 22
      }
    }
  ];

  return <StateMixedBar state={"New York"} countyStats={countyStats} />;
});
