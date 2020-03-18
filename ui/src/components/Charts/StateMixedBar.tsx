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

type Props = {
  state?: string;
  county?: string;
  timeSeries: CovidDateData;
  stat: "confirmed" | "dead";
  stateCount: boolean;
};

const colors = ["#FEEFB3", "#ECAC53", "#E16742", "#fdae61"];

export const StateMixedBar = (props: Props) => {
  let applicableCounties: string[] = [];
  let title = `Top 10 Counties`;
  if ((props.stateCount && props.state) || props.county) {
    return null;
  }

  if (props.state) {
    const name = Object.values(props.timeSeries)[0].states[props.state].Name;
    title = `Top 10 Counties in ${name}`;
  }


  Object.values(props.timeSeries).forEach(({ states, counties }) => {
    if (props.stateCount) {
      title = "Top 10 States";
      applicableCounties = Object.keys(states);
    } else if (props.state) {
      const state = Object.values(states).find(el => el.ID === props.state);
      applicableCounties.push(...(state?.CountyIDs || []));
    } else {
      applicableCounties = Object.keys(counties);
    }
  });

  let maxCases = 0;

  const dates = Object.keys(props.timeSeries).sort();
  const counties = Object.entries(props.timeSeries).reduce(
    (acc, [date, { counties, states }]) => {
      const entries = props.stateCount ? states : counties;
      Object.entries(entries).forEach(([, { Name, Confirmed, Dead, ID }]) => {
        if (!applicableCounties.includes(ID)) return acc;
        maxCases = Math.max(Confirmed, Dead, maxCases);
        if (!acc[Name]) acc[Name] = {};
        if (props.stat === "confirmed") {
          acc[Name][date] = Confirmed;
        } else {
          acc[Name][date] = Dead;
        }
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
      <h3>{title}</h3>
      <BarChart
        barSize={10}
        width={window.innerWidth * .9}
        height={600}
        data={sortedData.slice(0, 10)}
        margin={{
          top: 0,
          right: 0,
          left: 0,
          bottom: 0
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          angle={-45}
          interval={0}
          textAnchor="end"
          height={100}
          dataKey="Name"
        />
        <YAxis domain={[0, getYMaxFromMaxCases(maxCases)]} />
        <Tooltip />
        <Legend />
        {dates.map((date, i) => (
          <Bar key={date} dataKey={date} fill={colors[i]} />
        ))}
      </BarChart>
    </>
  );
};
