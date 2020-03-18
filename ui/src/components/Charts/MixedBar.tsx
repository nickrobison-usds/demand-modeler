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
import { getContiesForState, getYMaxFromMaxCases } from "../../utils/utils";

type Props = {
  state?: string;
  county?: string;
  timeSeries: CovidDateData;
  stat: "confirmed" | "dead";
};

const colors = ["#FEEFB3", "#ECAC53", "#E16742", "#fdae61"];

export const MixedBar = (props: Props) => {
  let title = "Grand Total";

  let maxCases = 0;
  let maxCasesByDate: { [d: string]: number } = {};

  const dates = Object.keys(props.timeSeries).sort();
  const data = dates.map(date => {
    let total = 0;
    if (props.county) {
      total =
        props.stat === "confirmed"
          ? props.timeSeries[date].counties[props.county].Confirmed
          : props.timeSeries[date].counties[props.county].Dead;
      maxCasesByDate[date] =
        (maxCasesByDate[date] || 0) +
        props.timeSeries[date].counties[props.county].Confirmed;
    } else if (props.state) {
      Object.values(
        getContiesForState(props.timeSeries, date, props.state)
      ).forEach(s => {
        const count = props.stat === "confirmed" ? s.Confirmed : s.Dead;
        maxCasesByDate[date] = (maxCasesByDate[date] || 0) + s.Confirmed;
        total += count;
      });
    } else {
      Object.values(props.timeSeries[date].states).forEach(s => {
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
        barSize={10}
        width={window.innerWidth * .9}
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
        <Bar dataKey="Grand Total" fill={colors[0]} />
      </BarChart>
    </div>
  );
};
