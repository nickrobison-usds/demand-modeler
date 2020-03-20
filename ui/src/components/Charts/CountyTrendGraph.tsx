import React from "react";
import { LineChart, Line, XAxis, CartesianGrid, Tooltip } from "recharts";
import { CovidDateData } from "../../app/AppStore";
import { stateAbbreviation } from "../../utils/stateAbbreviation";
import { monthDay } from "../../utils/DateUtils";

interface Props {
  timeSeries: CovidDateData;
};

interface DataPoint {
  Date: string; // Date string
  [countyName: string]: number | string;
}

const MIN_CASES = 20;

export const CountyTrendGraph = (props: Props) => {
  let dates: string[];
  let data: DataPoint[] = [];

  const countyData = Object.keys(props.timeSeries.counties).flatMap(
    k => props.timeSeries.counties[k]
  ).filter(c => c.Confirmed >= MIN_CASES);

  dates = [
    ...new Set(countyData.map(({ Reported }) => monthDay(Reported)))
  ].sort();
  console.log(dates)
  const counties = countyData.reduce((acc, el) => {
    const name = `${el.County}, ${stateAbbreviation[el.State]}`;
    if (!acc[name]) acc[name] = {};
    acc[name][monthDay(el.Reported)] = el.Confirmed;
    return acc;
  }, {} as { [c: string]: { [d: string]: number } });

  dates.forEach((date) => {
    const dataPoint: DataPoint = {
      Date: date
    };
    Object.keys(counties).forEach(key => {
      dataPoint[key] = counties[key][date];
    });
    data.push(dataPoint);
  });

  return (
    <>
      <h3>Reported Cases in Counties with 20+ cases</h3>
      <LineChart
        width={400}
        height={400}
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <XAxis dataKey="Date" />
        <Tooltip />
        <CartesianGrid stroke="#f5f5f5" />
        {Object.keys(counties).map(e =>
          <Line type="monotone" dataKey={e} stroke="#ff7300" yAxisId={e} />
        )}
      </LineChart>
    </>
  );
};
