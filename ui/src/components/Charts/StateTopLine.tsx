import React from "react";
import {
  LineChart,
  Line,
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
import { stateAbbreviation } from "../../utils/fips/stateAbbreviation";
import { monthDay } from "../../utils/DateUtils";
import { RenderChart } from "./RenderChart";

type Props = {
  timeSeries: CovidDateData;
  stat: "confirmed" | "dead";
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
  "#700000", "#500000"
];

export const StateTopLine = (props: Props) => {
  let title: string;
  let maxCases: number | undefined;
  let dates: string[];
  let data;
  let stateName: string = "";

  // Top 10 Counties (total or in state)
  title = `Counties with the highest number of cases`;

  let countyData = Object.keys(props.timeSeries.counties).flatMap(
    k => props.timeSeries.counties[k]
  );
  if (props.meta) {
    maxCases = props.meta.maxConfirmedCounty;
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

  const dedupedData: any[] = [];
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

  // const sortedData = dedupedData.sort((a, b) => {
  //   const { Name: aName, ...aData } = a;
  //   const { Name: bName, ...bData } = b;
  //   const aSum = (Object.values(aData) as number[]).reduce(
  //     (acc, el) => acc + el,
  //     0
  //   );
  //   const bSum = (Object.values(bData) as number[]).reduce(
  //     (acc, el) => acc + el,
  //     0
  //   );
  //   return bSum - aSum;
  // });

  const displayDates: string[] = [];
  const displayDateSet = new Set();
  dates.forEach(d => {
    const key = d.split("|")[0];
    if (!displayDateSet.has(key)) {
      displayDates.push(key);
      displayDateSet.add(key);
    }
  });

  return (
    <>
      <RenderChart
        reportView={props.reportView}
        title={props.title ? props.title : title}
      >
        <LineChart
          width={window.innerWidth * 0.9}
          height={880}
          data={dedupedData.slice(0, 10)}
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
          {displayDates.map((date, i) => (
            <line type="monotone" key="confirmed" stroke={colors[i]} />
          ))}
        </LineChart>
      </RenderChart>
    </>
  );
};
