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

type Props = {
  state: string;
  timeSeries: CovidDateData;
};

const colors = ["#E5A3A3", "#D05C5B", "#CB2626", "#C00001"];

export const StateMixedBar = (props: Props) => {
  let applicableCounties: string[] = [];
  let stateName;

  Object.values(props.timeSeries).forEach(({ states }) => {
    const state = Object.values(states).find(el => el.ID === props.state);
    stateName = state?.Name;
    applicableCounties.push(...(state?.CountyIDs || []));
  });

  const dates = Object.keys(props.timeSeries).sort();
  const counties = Object.entries(props.timeSeries).reduce(
    (acc, [date, { counties }]) => {
      Object.entries(counties).forEach(([, { Name, Confirmed, ID }]) => {
        if (!applicableCounties.includes(ID)) return acc;
        if (!acc[Name]) acc[Name] = {};
        acc[Name][date] = Confirmed;
        return acc;
      });
      return acc;
    },
    {} as { [N: string]: { [D: string]: number } }
  );
  const data = Object.entries(counties).reduce((acc, [Name, data]) => {
    acc.push({
      Name,
      ...data
    });
    return acc;
  }, [] as { [k: string]: string | number }[]);

  const sortedData = data.sort((a, b) => {
    const { Name: aName, ...aData } = a;
    const { Name: bName, ...bData } = b;
    const aSum = (Object.values(aData) as number[]).reduce(
      (acc, el) => acc + el,
      0
    );
    const bSum = (Object.values(bData) as number[]).reduce(
      (acc, el) => acc + el,
      0
    );
    return bSum - aSum;
  });

  return (
    <>
      <h2>{stateName}</h2>
      <BarChart
        width={1000}
        height={300}
        data={sortedData.slice(0, 10)}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis height={60} dataKey="Name" />
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
