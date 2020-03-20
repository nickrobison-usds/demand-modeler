import React, { useContext } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import {
  CovidDateData,
  GraphMetaData,
  EXCLUDED_STATES,
  AppContext,
  County,
  State
} from "../../app/AppStore";
import { getYMaxFromMaxCases } from "../../utils/utils";
import {
  getSelectedStateName,
  getTopCounties,
  getTopStates,
  getDatasetDates
} from "../../utils/calculations";

type Props = {
  state?: string;
  county?: string;
  timeSeries: CovidDateData;
  stat: "confirmed" | "dead";
  stateCount: boolean;
  reportView?: boolean;
  meta?: GraphMetaData;
  title?: string;
};

const colors = [
  "#E5A3A3",
  "#D05C5C",
  "#CB2727",
  "#C00000",
  "#900000",
  "#700000"
];

export const StateMixedBar = (props: Props) => {
  const { state } = useContext(AppContext);
  if ((props.stateCount && props.state) || props.county) {
    return null;
  }
  let title: string;
  let maxCases: number | undefined;
  const dates = getDatasetDates(state).reverse();
  let counties: County[][] = [];
  let states: State[][] = [];
  let stateName: string = "";

  // Top 10 Counties (total or in state)
  if (props.state || !props.stateCount) {
    stateName = getSelectedStateName(state) || "";
    if (stateName !== "") {
      title = `${stateName}`;
    } else {
      title = `Counties with the highest number of cases`;
    }
    counties = getTopCounties(state, props.stat);
  } else {
    // Top 10 states
    title = "States with the highest number of cases";
    states = getTopStates(state, props.stat);
  }

  let data;
  if (counties.length) {
    data = counties.map(county => {
      return county.reduce((acc, el) => {
        return {
          Name: el.County,
          [el.Reported.toLocaleDateString()]:
            props.stat === "confirmed" ? el.Confirmed : el.Dead,
          ...acc
        };
      }, {});
    });
  } else if (states.length) {
    data = states.map(state => {
      return state.reduce((acc, el) => {
        return {
          Name: el.State,
          [el.Reported.toLocaleDateString()]:
            props.stat === "confirmed" ? el.Confirmed : el.Dead,
          ...acc
        };
      }, {});
    });
  }

  return (
    <>
      <h3>{props.title ? props.title : title}</h3>
      <BarChart
        barSize={10}
        width={window.innerWidth * 0.9}
        height={600}
        data={data}
        margin={{
          top: 0,
          right: 0,
          left: 0,
          bottom: 0
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          angle={-45}
          interval={0}
          textAnchor="end"
          height={100}
          dataKey="Name"
        />
        <YAxis
          domain={
            maxCases && !EXCLUDED_STATES.includes(stateName as any)
              ? [0, getYMaxFromMaxCases(maxCases)]
              : undefined
          }
        />
        <Tooltip />
        <div style={{ padding: "10px" }} />
        <Legend />
        {dates.map((date, i) => (
          <Bar key={date} dataKey={date.split("|")[0]} fill={colors[i]} />
        ))}
      </BarChart>
    </>
  );
};
