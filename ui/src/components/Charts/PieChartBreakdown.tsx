import React from "react";
import { CovidDateData } from "../../app/AppStore";
import { PieChart, Pie, ResponsiveContainer, Legend, Cell } from "recharts";
import { interpolateRainbow } from "d3";

type Props = {
  state?: string;
  county?: string;
  timeSeries: CovidDateData;
  stat: "confirmed" | "dead";
  chartWidth?: number;
};

export const PieChartBreakdown: React.FC<Props> = props => {
  const { states } = props.timeSeries;
  const latestDate = Object.values(states)[0].sort((a, b) =>
    b.Reported > a.Reported ? 1 : -1
  )[0].Reported;
  const data = Object.values(states).reduce((acc, el, i) => {
    const latest = el.find(
      ({ Reported }) => Reported.toDateString() === latestDate.toDateString()
    );
    if (latest) {
      acc.push({
        name: latest.State,
        value: latest.Confirmed,
        color: interpolateRainbow(i / Object.values(states).length)
      });
    }
    return acc;
  }, [] as { name: string; value: number; color: string }[]);

  data.sort((a, b) => (b.value > a.value ? 1 : -1));

  return (
    <>
      <h3>Case distribution by state</h3>
      <ResponsiveContainer height={300} width="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
          >
            {data.map(el => (
              <Cell fill={el.color} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
};
