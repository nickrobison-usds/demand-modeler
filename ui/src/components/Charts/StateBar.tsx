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
import { StripedFill } from "./StripedFill";
import { population } from "../../utils/fips/population";
import { formatNum } from "../../utils/utils";
import * as fips from "../../utils/fips";
import * as timeSeries from "../../utils/timesSeries";

type Props = {
  state: string;
  timeSeries: CovidDateData;
  stat: "confirmed" | "dead";
  stateCount: boolean;
  reportView?: boolean;
  meta?: GraphMetaData;
  title?: string;
  chartWidth?: number;
  new?: boolean;
  dataMode?: "top10" | "over20Cases";
};

export const StateBar = (props: Props) => {
  if (props.stateCount && props.state) {
    return null;
  }
  const dataMode = props.dataMode || "top10";

  const colors =
    props.stat === "confirmed"
      ? [
          "#E5A3A3",
          "#D05C5C",
          "#CB2727",
          "#C00000",
          "#900000",
          "#700000",
          "#500000"
        ]
      : ["#a9a9a9", "#888", "#666", "#333", "#111"];
  let title: string;
  let maxCases: number | undefined;
  let dates: string[];
  let data;
  let stateName: string = "";

  stateName = fips.getStateName(props.state);
  title =
    dataMode === "top10"
      ? `${stateName} top 10 counties with the most ${
          props.stat === "confirmed" ? "confirmed cases" : "deaths"
        }`
      : `${stateName} counties with 20+ ${
          props.stat === "confirmed" ? "confirmed cases" : "deaths"
        }`;

  const countyData = props.state
    ? timeSeries.getCountyDataForState(props.timeSeries, props.state)
    : timeSeries.getCountyData(props.timeSeries);

  if (props.meta) {
    maxCases =
      props.stat === "confirmed"
        ? props.meta.maxConfirmedCounty
        : props.meta.maxDeadCounty;
  }
  dates = [
    ...new Set(countyData.map(({ Reported }) => monthDay(Reported)))
  ].sort();
  const popMap: { [ID: string]: number } = {};
  const counties = countyData.reduce((acc, el) => {
    popMap[el.ID] = population[el.ID];
    if (!acc[el.ID]) acc[el.ID] = {};
    acc[el.ID][monthDay(el.Reported)] =
      props.stat === "confirmed" ? el.Confirmed : el.Dead;
    return acc;
  }, {} as { [c: string]: { [d: string]: number } });
  data = Object.entries(counties)
    .reduce((acc, [ID, data]) => {
      acc.push({
        Name: `${fips.getCountyName(ID)}${
          popMap[ID] ? ` (${formatNum(popMap[ID])})` : ""
        }`,
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

  if (dataMode === "over20Cases") {
    data = data.filter(el => el[dates[dates.length - 1]] >= 20);
  }

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
        if (d[i].toString() === d[i + 1].toString()) {
          continue;
        }
      }
      dedupedElement[d[i].toString()] = e[key];
    }
    dedupedData.push(dedupedElement);
  });

  const displayDates: string[] = [];
  const displayDateSet = new Set();
  dates.forEach(d => {
    const key = d.split("|")[1];
    if (!displayDateSet.has(key)) {
      displayDates.push(key);
      displayDateSet.add(key);
    }
  });

  if (dataMode === "top10") {
    dedupedData = dedupedData.slice(0, 10);
  }

  const finalData = dedupedData.map(data => {
    const obj: { [k: string]: string | number } = {};
    const entries = Object.entries(data);
    entries.forEach(([k, value], i) => {
      const key = k.split("|")[1];
      if (k !== "Name" && i > 0) {
        let newCases = (value as number) - (entries[i - 1][1] as number);
        if (newCases < 0) newCases = 0;
        obj[`${key} New`] = newCases;
        obj[`${key} Existing`] = (value as number) - newCases;
      } else if (k !== "Name" && i === 0) {
        obj[`${key} Existing`] = value;
        obj[`${key} New`] = 0;
      }
      obj[k] = value;
    });
    return obj;
  });

  return (
    <>
      <h3>{props.title ? props.title : title}</h3>
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
        <Legend
          content={
            <CustomLegend
              displayDates={displayDates}
              colors={colors}
              stat={props.stat}
            />
          }
        />
        {displayDates.map((date, i) => {
          return (
            <Bar
              id={`${date}`}
              key={`${date} New`}
              stackId={`${date}`}
              dataKey={`${date} New`}
              shape={<StripedFill fill={colors[i]} />}
            />
          );
        })}
        {displayDates.map((date, i) => {
          return props.new ? null : (
            <Bar
              key={`${date} Existing`}
              id={`${date}`}
              stackId={date}
              dataKey={`${date} Existing`}
              fill={colors[i]}
            />
          );
        })}
      </BarChart>
    </>
  );
};

type LegendProps = {
  displayDates: string[];
  colors: string[];
  stat: Stat;
};

const label = (stat: Stat) => {
  switch (stat) {
    case "dead":
      return "New Deaths";
    case "confirmed":
      return "New Cases";
    case "mortalityRate":
      return "Change in mortality rate";
  }
};

export const CustomLegend: React.FC<LegendProps> = ({
  displayDates,
  colors,
  stat
}) => (
  <div style={{ textAlign: "center", margin: "40px 0 0 0" }}>
    {displayDates.map((date, i) => (
      <React.Fragment key={date}>
        <span
          style={{
            display: "inline-block",
            height: "10px",
            width: "10px",
            backgroundColor: colors[i],
            margin: "0 5px 0 10px"
          }}
        ></span>
        {date}
      </React.Fragment>
    ))}
    <span
      style={{
        display: "inline-block",
        height: "10px",
        width: "10px",
        background: `repeating-linear-gradient(
                      135deg,
                      ${stat === "confirmed" ? "#CB2727" : "#111"},
                      ${stat === "confirmed" ? "#CB2727" : "#111"} 2px,
                      #FFFFFF 2px,
                      #FFFFFF 4px
                    )`,
        margin: "0 5px 0 10px"
      }}
    ></span>
    {label(stat)}
  </div>
);
