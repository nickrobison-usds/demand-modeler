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
import { getContiesForState } from "../../utils/utils";

type Props = {
  state?: string;
  county?: string;
  timeSeries: CovidDateData;
  stat: "confirmed" | "dead";
};

const colors = ["#E5A3A3", "#D05C5B", "#CB2626", "#C00001"];

export const MixedBar = (props: Props) => {
  let title = "Grand Total";

  const dates = Object.keys(props.timeSeries).sort();
  const data = dates.map(date => {
    let total = 0;
    if (props.county) {
      total = props.stat === "confirmed" ?
        props.timeSeries[date].counties[props.county].Confirmed :
        props.timeSeries[date].counties[props.county].Dead
    } else if (props.state) {
      Object.values(getContiesForState(props.timeSeries, date, props.state)).forEach(s => {
        const count = props.stat === "confirmed" ? s.Confirmed : s.Dead;
        total += count;
      });
    } else {
      Object.values(props.timeSeries[date].states).forEach(s => {
        const count = props.stat === "confirmed" ? s.Confirmed : s.Dead;
        total += count;
      });
    }

    return {
      Name: date,
      "Grand Total": total
    };
  });
  return (
    <>
      <h3>{title}</h3>
      <BarChart
        barSize={10}
        width={400}
        height={300}
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
        <YAxis dataKey="Grand Total" />
        <Tooltip />
        <Legend />
        <Bar dataKey="Grand Total" fill={colors[0]} />
      </BarChart>
    </>
  );
};
