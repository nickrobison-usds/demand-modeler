import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { CovidDateData } from "../../app/AppStore";
import { getYMaxFromMaxCases } from "../../utils/utils";
import { formatDate } from "../../utils/DateUtils";

type Props = {
  state?: string;
  county?: string;
  timeSeries: CovidDateData;
  stat: "confirmed" | "dead";
  stateCount: boolean;
  reportView?: boolean;
  title?: string;
};

const colors = ["#E5A3A3", "#D05C5C", "#CB2727", "#C00000"];

export const StateMixedBar = (props: Props) => {
  if ((props.stateCount && props.state) || props.county) {
    return null;
  }
  let title: string;
  let maxCases: number;
  let dates: string[];
  let data;

  // Top 10 Counties (total or in state)
  if (props.state || !props.stateCount) {
    const stateName =
      props.timeSeries.states.find(state => state.ID === props.state)?.State ||
      "";
    if (stateName) {
      title = `${stateName}`;

    } else {
      title = `Counties with the highest number of cases`;

    }
    let countyData = props.timeSeries.counties;
    if (props.state) {
      countyData = countyData.filter(({ State }) => State === stateName);
    }
    const maxCasesByCounty = countyData.reduce((acc, el) => {
      acc[el.County] = acc[el.County] || 0 + el.Confirmed;
      return acc;
    }, {} as { [c: string]: number });
    maxCases = Math.max(...Object.values(maxCasesByCounty));
    dates = [
      ...new Set(countyData.map(({ Reported }) => formatDate(Reported)))
    ].sort();
    const counties = countyData.reduce((acc, el) => {
      if (!acc[el.County]) acc[el.County] = {};
      acc[el.County][formatDate(el.Reported)] =
        props.stat === "confirmed" ? el.Confirmed : el.Dead;
      return acc;
    }, {} as { [c: string]: { [d: string]: number } });
    data = Object.entries(counties).reduce((acc, [Name, data]) => {
      acc.push({
        Name,
        ...data
      });
      return acc;
    }, [] as { [k: string]: string | number }[]);
  } else {
    // Top 10 states
    title = "States with the highest number of cases";
    const stateData = props.timeSeries.states;
    dates = [
      ...new Set(stateData.map(({ Reported }) => formatDate(Reported)))
    ].sort();
    const maxCasesByState = stateData.reduce((acc, el) => {
      acc[el.State] = acc[el.State] || 0 + el.Confirmed;
      return acc;
    }, {} as { [c: string]: number });
    maxCases = Math.max(...Object.values(maxCasesByState));
    const states = stateData.reduce((acc, el) => {
      if (!acc[el.State]) acc[el.State] = {};
      acc[el.State][formatDate(el.Reported)] =
        props.stat === "confirmed" ? el.Confirmed : el.Dead;
      return acc;
    }, {} as { [c: string]: { [d: string]: number } });
    data = Object.entries(states).reduce((acc, [Name, data]) => {
      acc.push({
        Name,
        ...data
      });
      return acc;
    }, [] as { [k: string]: string | number }[]);
  }

  const sortedData = data.sort((a, b) => {
    const { Name: aName, ...aData } = a;
    const { Name: bName, ...bData } = b;
    const aSum = (Object.values(aData) as number[]).reduce(
      (acc, el) => acc + el,
      0
    );
    const bSum = (Object.values(bData) as number[]).reduce(
      (acc, el) => acc + el,
      0
    );
    return bSum - aSum;
  });

  return (
    <>
      <h3>{props.title ? props.title : title}</h3>
      <BarChart
        barSize={10}
        width={props.reportView ? window.innerWidth * 0.9 : 400}
        height={props.reportView ? 600 : 300}
        data={sortedData.slice(0, 10)}
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
        <YAxis domain={[0, getYMaxFromMaxCases(maxCases)]} />
        <Tooltip />
        <div style={{padding: "10px"}}/>
        <Legend />
        {dates.map((date, i) => (
          <Bar key={date} dataKey={date} fill={colors[i]} />
        ))}
      </BarChart>
    </>
  );
};
