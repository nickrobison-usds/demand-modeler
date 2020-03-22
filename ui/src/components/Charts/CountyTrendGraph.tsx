import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { CovidDateData } from "../../app/AppStore";
import { stateAbbreviation } from "../../utils/stateAbbreviation";
import { monthDay } from "../../utils/DateUtils";

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

  const randomColor = () => {
    const generate = () => Math.floor(Math.random() * 205 + 50);
    const [R, G, B] = [generate(), generate(), generate()];
    return `rgb(${R},${G},${B})`;
  };

  console.log(data);

  return (
    <>
      <h3>Reported Cases in Counties with 20+ cases</h3>
      <LineChart
        width={props.chartWidth || window.innerWidth * 0.9}
        height={800}
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <XAxis dataKey="Date" />
        <Tooltip />
        <CartesianGrid stroke="#f5f5f5" />
        {Object.keys(counties).map(e => (
          <Line key={e} dataKey={e} stroke={randomColor()} yAxisId={e} />
        ))}
        <Legend align="left" />
      </LineChart>
    </>
  );
};
