import React, { useContext } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { CovidDateData, AppContext } from "../../app/AppStore";
import { getGrandTotal } from "../../utils/calculations";

type Props = {
  state?: string;
  county?: string;
  timeSeries: CovidDateData;
  stat: "confirmed" | "dead";
  reportView?: boolean;
};

export const MixedBar = (props: Props) => {
  const { state } = useContext(AppContext);
  const title = "Grand Total";
  const grandTotal = getGrandTotal(state);

  const data = Object.entries(grandTotal)
    .reduce((acc, [date, stats]) => {
      acc.push({
        Name: date,
        "Grand Total": props.stat === "confirmed" ? stats.Confirmed : stats.Dead
      });
      return acc;
    }, [] as { Name: string; "Grand Total": number }[])
    .reverse();

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
        <YAxis dataKey="Grand Total" />
        <Tooltip />
        <Legend />
        <Bar dataKey="Grand Total" fill="#900000" />
      </BarChart>
    </div>
  );
};
