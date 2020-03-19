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

const colors = ["#FEEFB3", "#ECAC53", "#E16742", "#fdae61"];

export const MixedBar = (props: Props) => {
  let title = "Grand Total";

  let maxCases = 0;
  let maxCasesByDate: { [d: string]: number } = {};

  // const dates = Object.keys(props.timeSeries).sort();
  const dates = [
    ...new Set(
      props.timeSeries.counties.map(({ Reported }) => formatDate(Reported))
    )
  ].sort();
  const data = dates.map(date => {
    let total = 0;
    if (props.county) {
      total = props.timeSeries.counties
        .filter(
          ({ Reported, ID }) =>
            formatDate(Reported) === date && ID === props.county
        )
        .reduce((acc, el) => {
          return acc + el[props.stat === "confirmed" ? "Confirmed" : "Dead"];
        }, 0);
      maxCasesByDate[date] = (maxCasesByDate[date] || 0) + total;
    } else if (props.state) {
      const state = props.timeSeries.states.find(({ ID }) => ID === props.state)
        ?.State;

      const counties = props.timeSeries.counties.filter(
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
      props.timeSeries.states
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
        barSize={10}
        width={props.reportView ? window.innerWidth * 0.9 : 400}
        height={props.reportView ? 600 : 300}
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
