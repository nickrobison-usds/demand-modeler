import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  YAxis,
  Label
} from "recharts";
import { CovidDateData } from "../../app/AppStore";
import { stateAbbreviation } from "../../utils/stateAbbreviation";
import { monthDay } from "../../utils/DateUtils";
import { interpolateRainbow } from "d3";

interface Props {
  timeSeries: CovidDateData;
  chartWidth?: number;
}

interface DataPoint {
  Date: string; // Date string
  [countyName: string]: number | string;
}

const MIN_CASES = 20;

export const CountyTrendGraph = (props: Props) => {
  let dates: string[];
  let data: DataPoint[] = [];

  const countyData = Object.keys(props.timeSeries.counties)
    .flatMap(k => props.timeSeries.counties[k])
    .filter(c => c.Confirmed >= MIN_CASES);

  dates = [
    ...new Set(
      countyData.map(({ Reported }) => monthDay(Reported).split("|")[0])
    )
  ].sort();

  const counties = countyData.reduce((acc, el) => {
    const name = `${el.County}, ${stateAbbreviation[el.State]}`;
    if (!acc[name]) acc[name] = {};
    acc[name][monthDay(el.Reported).split("|")[0]] = el.Confirmed;
    return acc;
  }, {} as { [c: string]: { [d: string]: number } });

  dates.forEach(date => {
    const dataPoint: DataPoint = {
      Date: date
    };
    Object.keys(counties).forEach(key => {
      dataPoint[key] = counties[key][date];
    });
    data.push(dataPoint);
  });

  // Label order based on most recent day
  const lastDay = { ...data[data.length - 1] };
  delete lastDay.Date;
  const labelColors: { [n: string]: string } = Object.entries(lastDay)
    .map(([name], i) => ({
      name,
      color: interpolateRainbow(i / Object.entries(lastDay).length)
    }))
    .reduce((acc, el) => {
      acc[el.name] = el.color;
      return acc;
    }, {} as { [n: string]: string });

  console.log(labelColors);

  const labelOrder = Object.entries(lastDay)
    .sort((a, b) => {
      if (a[1] === undefined || b[1] > a[1]) return 1;
      if (b[1] === undefined || a[1] > b[1]) return -1;
      return 0;
    })
    .map(el => el[0]);

  return (
    <>
      <h3>Counties with 20+ reported cases</h3>
      <LineChart
        width={props.chartWidth || window.innerWidth * 0.9}
        height={800}
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <XAxis dataKey="Date" />
        <YAxis type="number" scale="linear">
          <Label
            dx={-5}
            angle={-90}
            value="Confirmed cases"
            position="insideLeft"
            style={{ textAnchor: "middle" }}
          />
        </YAxis>
        <Tooltip />
        <CartesianGrid stroke="#f5f5f5" />
        {labelOrder.map((e, i) => (
          <Line
            key={e}
            dataKey={e}
            stroke={labelColors ? labelColors[e as any] : "#000"}
            strokeWidth={2}
            dot={false}
          />
        ))}
        <Legend align="left" />
      </LineChart>
    </>
  );
};
