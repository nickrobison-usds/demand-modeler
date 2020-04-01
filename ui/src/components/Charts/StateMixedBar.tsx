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
import {
  CovidDateData,
  GraphMetaData,
  EXCLUDED_STATES
} from "../../app/AppStore";
import { getYMaxFromMaxCases } from "../../utils/utils";
import { monthDay } from "../../utils/DateUtils";
import { RenderChart } from "./RenderChart";
import { StripedFill } from "./StripedFill";
import { CustomLegend } from "./StateBar";

type Props = {
  state?: string;
  county?: string;
  timeSeries: CovidDateData;
  stat: "confirmed" | "dead";
  stateCount: boolean;
  reportView?: boolean;
  meta?: GraphMetaData;
  title?: string;
  chartWidth?: number;
  new?: boolean;
};

export const StateMixedBar = (props: Props) => {
  if ((props.stateCount && props.state) || props.county) {
    return null;
  }
  const colors =
  props.stat === "confirmed"
    ? ["#E5A3A3", "#D05C5C", "#CB2727", "#C00000", "#900000", "#700000", "#500000"]
    : ["#a9a9a9", "#888", "#666", "#333", "#111"];
  let title: string;
  let maxCases: number | undefined;
  let dates: string[];
  let data;
  let stateName: string = "";

  // Top 10 Counties (total or in state)
  if (props.state || !props.stateCount) {
    stateName =
      Object.keys(props.timeSeries.states)
        .flatMap(k => props.timeSeries.states[k])
        .find(state => state.ID === props.state)?.State || "";
    if (stateName !== "") {
      title = `${stateName}`;
    } else {
      title = `Counties with the highest number of ${
        props.stat === "confirmed" ? "cases" : "deaths"
      }${props.new ? " (24 hours change)" : ""}`;
    }
    let countyData = Object.keys(props.timeSeries.counties).flatMap(
      k => props.timeSeries.counties[k]
    );
    if (props.state) {
      countyData = countyData.filter(({ State }) => State === stateName);
    }
    if (props.meta) {
      maxCases =
        props.stat === "confirmed"
          ? props.meta.maxConfirmedCounty
          : props.meta.maxDeadCounty;
    }
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
    title = `States with the highest number of ${
      props.stat === "confirmed" ? "cases" : "deaths"
    }`;
    const stateData = Object.keys(props.timeSeries.states).flatMap(
      k => props.timeSeries.states[k]
    );
    dates = [
      ...new Set(stateData.map(({ Reported }) => monthDay(Reported)))
    ].sort();
    if (props.meta) {
      maxCases =
        props.stat === "confirmed"
          ? props.meta.maxConfirmedState
          : props.meta.maxDeadState;
    }
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

  const dedupedData: { [k: string]: string | number }[] = [];
  data.forEach(e => {
    const dedupedElement: any = {};
    const d = Object.keys(e).sort();
    for (let i = 0; i < d.length; i++) {
      const key = d[i];
      if (!key.toString().includes("|")) {
        dedupedElement[key] = e[key];
        continue;
      }
      if (d[i + 1]) {
        if (
          d[i].toString().split("|")[0] === d[i + 1].toString().split("|")[0]
        ) {
          continue;
        }
      }
      dedupedElement[d[i].toString().split("|")[0]] = e[key];
    }
    dedupedData.push(dedupedElement);
  });

  const sortedData = dedupedData
    .sort((a, b) => {
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
    })
    .slice(0, 10);

  const displayDates: string[] = [];
  const displayDateSet = new Set();
  dates.forEach(d => {
    const key = d.split("|")[0];
    if (!displayDateSet.has(key)) {
      displayDates.push(key);
      displayDateSet.add(key);
    }
  });

  const finalData = sortedData.map(data => {
    const obj: { [k: string]: string | number } = {};
    const entries = Object.entries(data);
    entries.forEach(([key, value], i) => {
      if (key !== "Name" && i > 0) {
        let newCases = (value as number) - (entries[i - 1][1] as number);
        if (newCases < 0) newCases = 0;
        obj[`${key} New`] = newCases;
        obj[`${key} Existing`] = (value as number) - newCases;
      } else if (key !== "Name" && i === 0) {
        obj[`${key} Existing`] = value;
        obj[`${key} New`] = 0;
      }
      obj[key] = value;
    });
    return obj;
  });

  return (
    <>
      <RenderChart
        reportView={props.reportView}
        title={props.title ? props.title : title}
      >
        <BarChart
          barSize={10}
          width={props.reportView ? window.innerWidth * 0.9 : undefined}
          height={880}
          data={finalData}
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
          <Legend content={<CustomLegend displayDates={displayDates} colors={colors} stat={props.stat}/>}/>
          {displayDates.map((date, i) => {
            return (
              <Bar
                id={`${date.split("|")[0]}`}
                key={`${date.split("|")[0]} New`}
                stackId={`${date.split("|")[0]}`}
                dataKey={`${date.split("|")[0]} New`}
                shape={<StripedFill fill={colors[i]} />}
              />
            );
          })}
          {displayDates.map((date, i) => {
            return props.new ? (
              null
            ) : <Bar
            key={`${date.split("|")[0]} Existing`}
            id={`${date.split("|")[0]}`}
            stackId={date.split("|")[0]}
            dataKey={`${date.split("|")[0]} Existing`}
            fill={colors[i]}
          />;
          })}
        </BarChart>
      </RenderChart>
    </>
  );
};
