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
import { monthDay } from "../../utils/DateUtils";

type Props = {
  state?: string;
  county?: string;
  timeSeries: CovidDateData;
  stat: "confirmed" | "dead";
  stateCount: boolean;
  reportView?: boolean;
  title?: string;
};

const colors = ["#E5A3A3", "#D05C5C", "#CB2727", "#C00000", "#900000"];

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
      Object.keys(props.timeSeries.states).flatMap(k => props.timeSeries.states[k]).find(state => state.ID === props.state)?.State ||
      "";
    if (stateName) {
      title = `${stateName}`;

    } else {
      title = `Counties with the highest number of cases`;

    }
    let countyData = Object.keys(props.timeSeries.counties).flatMap(k => props.timeSeries.counties[k]);
    if (props.state) {
      countyData = countyData.filter(({ State }) => State === stateName);
    }
    const maxCasesByCounty = countyData.reduce((acc, el) => {
      acc[el.County] = acc[el.County] || 0 + el.Confirmed;
      return acc;
    }, {} as { [c: string]: number });
    maxCases = Math.max(...Object.values(maxCasesByCounty));
    dates = [
      ...new Set(countyData.map(({ Reported }) => monthDay(Reported)))
    ].sort();
    const counties = countyData.reduce((acc, el) => {
      if (!acc[el.County]) acc[el.County] = {};
      acc[el.County][monthDay(el.Reported)] =
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
    const stateData = Object.keys(props.timeSeries.states).flatMap(k => props.timeSeries.states[k]);
    dates = [
      ...new Set(stateData.map(({ Reported }) => monthDay(Reported)))
    ].sort();
    const maxCasesByState = stateData.reduce((acc, el) => {
      acc[el.State] = acc[el.State] || 0 + el.Confirmed;
      return acc;
    }, {} as { [c: string]: number });
    maxCases = Math.max(...Object.values(maxCasesByState));
    const states = stateData.reduce((acc, el) => {
      if (!acc[el.State]) acc[el.State] = {};
      acc[el.State][monthDay(el.Reported)] =
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

  const dedupedData: any[] = [];
  data.forEach(e => {
    const dateSet = new Set();
    const dedupede: any = {};
    Object.keys(e).forEach((k) => {
      if (k.toString().includes("|")) {
        const day = k.toString().split("|")[0]
        if (!dateSet.has(day)) {
          dedupede[day] = e[k];
          dateSet.add(day);
        }
      } else {
        dedupede[k] = e[k];
      }
    })
    dedupedData.push(dedupede)
  });

  const sortedData = dedupedData.sort((a, b) => {
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

  const displayDates: string[] = []
  const displayDateSet = new Set();
  dates.forEach(d => {
    const key = d.split("|")[0];
    if (!displayDateSet.has(key)) {
      displayDates.push(key)
      displayDateSet.add(key);
    }
  });

  return (
    <>
      <h3>{props.title ? props.title : title}</h3>
      <BarChart
        barSize={10}
        width={window.innerWidth * 0.9}
        height={600}
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
        {displayDates.map((date, i) => (
          <Bar key={date} dataKey={date.split("|")[0]} fill={colors[i]} />
        ))}
      </BarChart>
    </>
  );
};
