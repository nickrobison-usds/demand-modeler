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
  reportView?: boolean;
};

export const MixedBar = (props: Props) => {
  let title = "Grand Total";

  let maxCases = 0;
  let maxCasesByDate: { [d: string]: number } = {};

  // const dates = Object.keys(props.timeSeries).sort();
  const dates = [
    ...new Set(
      Object.keys(props.timeSeries.counties).flatMap(k => props.timeSeries.counties[k]).map(({ Reported }) => formatDate(Reported))
    )
  ].sort();
  const data = dates.map(date => {
    let total = 0;
    if (props.county) {
      total = props.timeSeries.counties[props.county]
        .filter(
          c => formatDate(c.Reported) === date)
        .reduce((acc, el) => {
          return acc + el[props.stat === "confirmed" ? "Confirmed" : "Dead"];
        }, 0);
      maxCasesByDate[date] = (maxCasesByDate[date] || 0) + total;
    } else if (props.state) {
        // We just need the first value in order to match the counties
      const state = props.timeSeries.states[props.state][0].ID;

      const counties = Object.keys(props.timeSeries.counties).flatMap(k => props.timeSeries.counties[k]).filter(
        ({ State }) => State === state
      );

      counties
        .filter(({ Reported }) => formatDate(Reported) === date)
        .forEach(s => {
          const count = props.stat === "confirmed" ? s.Confirmed : s.Dead;
          maxCasesByDate[date] = (maxCasesByDate[date] || 0) + s.Confirmed;
          total += count;
        });
    } else {
      Object.keys(props.timeSeries.states).flatMap(k => props.timeSeries.states[k])
        .filter(({ Reported }) => formatDate(Reported) === date)
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

  maxCases = Math.max(...Object.values(maxCasesByDate));

  return (
    <div>
      <h3>{title}</h3>
      <BarChart
        barSize={50}
        width={window.innerWidth * 0.9}
        height={600}
        data={data}
        margin={{
          top: 0,
          right: 0,
          left: 0,
          bottom: 0
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis height={60} dataKey="Name" />
        <YAxis
          dataKey="Grand Total"
          domain={[0, getYMaxFromMaxCases(maxCases)]}
        />
        <Tooltip />
        <Legend />
        <Bar dataKey="Grand Total" fill="#E4A3A4" />
      </BarChart>
    </div>
  );
};
