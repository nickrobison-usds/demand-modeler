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
import { stateAbbreviation } from "../../utils/stateAbbreviation";
import { monthDay } from "../../utils/DateUtils";
import { RenderChart } from "./RenderChart";
import { StripedFill } from "./StripedFill";
import { CustomLegend } from "./StateBar";

type Props = {
  timeSeries: CovidDateData;
  stat: Stat;
  reportView?: boolean;
  meta?: GraphMetaData;
  title?: string;
};

const getColors = (stat: Stat) => {
  switch (stat) {
    case "dead":
      return ["#a9a9a9", "#888", "#666", "#333", "#111"];
    case "confirmed":
        return ["#E5A3A3", "#D05C5C", "#CB2727", "#C00000", "#900000", "#700000"];
    case "mortalityRate":
        return ["#a9a9a9", "#888", "#666", "#333", "#111"];
  }
}

const getTitls = (stat: Stat) => {
  switch (stat) {
    case "dead":
      return "Counties with the highest number of deaths";
    case "confirmed":
        return "Counties with the highest number of cases";
    case "mortalityRate":
        return "Counties with the highest change in moratility rate";
  }
}


export const Top10Counties = (props: Props) => {
  let title: string;
  let maxCases: number | undefined;
  let dates: string[];
  let data;
  let stateName: string = "";
  const colors = getColors(props.stat);
  // Top 10 Counties (total or in state)
  title = `Counties with the highest number of ${
    props.stat === "confirmed" ? "cases" : "deaths"
  }`;

  let countyData = Object.keys(props.timeSeries.counties).flatMap(
    k => props.timeSeries.counties[k]
  );
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
    const name = `${el.County}, ${stateAbbreviation[el.State]}`;
    if (!acc[name]) acc[name] = {};
    acc[name][monthDay(el.Reported)] =
      props.stat === "confirmed" ? el.Confirmed : el.Dead;
    return acc;
  }, {} as { [c: string]: { [d: string]: number } });
  data = Object.entries(counties)
    .reduce((acc, [Name, data]) => {
      acc.push({
        Name,
        ...data
      });
      return acc;
    }, [] as { [k: string]: string | number }[])
    .sort((a, b) => {
      const lastIndex = dates.length - 1;
      return (
        ((b[dates[lastIndex]] as number) || 0) -
        ((a[dates[lastIndex]] as number) || 0)
      );
    });

  let dedupedData: { [k: string]: string | number }[] = [];
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

  const displayDates: string[] = [];
  const displayDateSet = new Set();
  dates.forEach(d => {
    const key = d.split("|")[0];
    if (!displayDateSet.has(key)) {
      displayDates.push(key);
      displayDateSet.add(key);
    }
  });

  dedupedData = dedupedData.slice(0, 10);

  const finalData = dedupedData.map(data => {
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
          width={window.innerWidth * 0.9}
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
          <Legend content={<CustomLegend displayDates={displayDates} colors={colors} stat={props.stat}/>} />
          {displayDates.map((date, i) => (
            <Bar
              key={`${date.split("|")[0]} New`}
              id={`${date.split("|")[0]}`}
              stackId={date.split("|")[0]}
              dataKey={`${date.split("|")[0]} New`}
              shape={<StripedFill fill={colors[i]} />}
            />
          ))}
          {displayDates.map((date, i) => (
            <Bar
              key={`${date.split("|")[0]} Existing`}
              id={`${date.split("|")[0]}`}
              stackId={date.split("|")[0]}
              dataKey={`${date.split("|")[0]} Existing`}
              fill={colors[i]}
            />
          ))}
        </BarChart>
      </RenderChart>
    </>
  );
};
