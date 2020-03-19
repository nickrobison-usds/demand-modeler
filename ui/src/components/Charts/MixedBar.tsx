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
import { monthDay } from "../../utils/DateUtils";

type Props = {
  state?: string;
  county?: string;
  timeSeries: CovidDateData;
  stat: "confirmed" | "dead";
  reportView?: boolean;
};

export const MixedBar = (props: Props) => {
  let title = "Grand Total";

  let maxCasesByDate: { [d: string]: number } = {};

  // const dates = Object.keys(props.timeSeries).sort();
  const dates = [
    ...new Set(
      Object.keys(props.timeSeries.counties)
        .flatMap(k => props.timeSeries.counties[k])
        .map(({ Reported }) => monthDay(Reported))
    )
  ].sort();
  const data = dates.map(date => {
    let total = 0;
    if (props.county) {
      total = props.timeSeries.counties[props.county]
        .filter(c => monthDay(c.Reported) === date)
        .reduce((acc, el) => {
          return acc + el[props.stat === "confirmed" ? "Confirmed" : "Dead"];
        }, 0);
      maxCasesByDate[date] = (maxCasesByDate[date] || 0) + total;
    } else if (props.state) {
      // We just need the first value in order to match the counties
      const state = props.timeSeries.states[props.state][0].State;

      const counties = Object.values(props.timeSeries.counties)
        .flat()
        .filter(({ State }) => State === state);

      counties
        .filter(({ Reported }) => monthDay(Reported) === date)
        .forEach(s => {
          const count = props.stat === "confirmed" ? s.Confirmed : s.Dead;
          maxCasesByDate[date] = (maxCasesByDate[date] || 0) + s.Confirmed;
          total += count;
        });
    } else {
      Object.keys(props.timeSeries.states)
        .flatMap(k => props.timeSeries.states[k])
        .filter(({ Reported }) => monthDay(Reported) === date)
        .forEach(s => {
          const count = props.stat === "confirmed" ? s.Confirmed : s.Dead;
          maxCasesByDate[date] = (maxCasesByDate[date] || 0) + s.Confirmed;
          total += count;
        });
    }
    return {
      Name: date,
      "Grand Total": total
    };
  });
  const dedupedData: any[] = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i+1]) {
      if (data[i].Name.split("|")[0] === data[i+1].Name.split("|")[0]) {
        continue;
      }
    }
    data[i].Name = data[i].Name.split("|")[0];
    dedupedData.push(data[i]);
  }

  return (
    <div>
      <h3>{title}</h3>
      <BarChart
        barSize={50}
        width={window.innerWidth * 0.9}
        height={600}
        data={dedupedData}
        margin={{
          top: 0,
          right: 0,
          left: 0,
          bottom: 0
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis height={60} dataKey="Name" />
        <YAxis dataKey="Grand Total" />
        <Tooltip />
        <Legend />
        <Bar dataKey="Grand Total" fill="#900000" />
      </BarChart>
    </div>
  );
};
