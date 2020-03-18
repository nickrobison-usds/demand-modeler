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

export type CountyStat = {
  Name: string;
  data: {
    [k: string]: number;
  };
};

type Props = {
  state: string;
  countyStats: CountyStat[];
};

const colors = ["#E5A3A3", "#D05C5B", "#CB2626", "#C00001"];

export const StateMixedBar = (props: Props) => {
  const dates = Object.keys(props.countyStats[0].data);

  const sortedStats = [...props.countyStats].sort((a, b) => {
    const aSum = Object.values(a.data).reduce((acc, el) => acc + el, 0);
    const bSum = Object.values(b.data).reduce((acc, el) => acc + el, 0);
    return bSum - aSum;
  });

  const data = sortedStats.reduce((acc, el) => {
    const stats = {
      Name: el.Name,
      ...el.data
    };
    acc.push(stats);
    return acc;
  }, [] as { [k: string]: string | number }[]);

  return (
    <>
      <h2>{props.state}</h2>
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="Name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {dates.map((date, i) => (
          <Bar key={date} dataKey={date} fill={colors[i]} />
        ))}
      </BarChart>
    </>
  );
};
