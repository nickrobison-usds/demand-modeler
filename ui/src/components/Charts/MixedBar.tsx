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
import { RenderChart } from "./RenderChart";
import { getSelectedLocationName } from "../../utils/utils";
import { StripedFill } from "./StripedFill";
import * as fips from "../../utils/fips";

interface Props {
  state?: string;
  county?: string;
  timeSeries: CovidDateData;
  stat: "confirmed" | "dead";
  reportView?: boolean;
  chartWidth?: number;
}

export const MixedBar = (props: Props) => {
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
      const county = props.timeSeries.counties[props.county];
      total = county
        ? county
            .filter(c => monthDay(c.Reported) === date)
            .reduce((acc, el) => {
              return (
                acc + el[props.stat === "confirmed" ? "Confirmed" : "Dead"]
              );
            }, 0)
        : 0;
      maxCasesByDate[date] = (maxCasesByDate[date] || 0) + total;
    } else if (props.state) {
      // We just need the first value in order to match the counties
      const state = fips.getStateName(props.timeSeries.states[props.state][0].ID);

      const counties = Object.values(props.timeSeries.counties)
        .flat()
        .filter(({ ID }) =>  fips.getStateName(ID) === state);

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
    if (data[i + 1]) {
      if (data[i].Name.split("|")[1] === data[i + 1].Name.split("|")[1]) {
        continue;
      }
    }
    data[i].Name = data[i].Name.split("|")[1];
    dedupedData.push(data[i]);
  }

  const locationName = getSelectedLocationName(
    props.state,
    props.county,
    props.timeSeries
  );

  const finalData = dedupedData.map((data, i) => {
    if (!dedupedData[i - 1]) {
      return { ...data, Existing: data["Grand Total"] };
    }
    let newCases = data["Grand Total"] - dedupedData[i - 1]["Grand Total"];
    if (newCases < 0) newCases = 0;
    return {
      ...data,
      New: newCases,
      Existing: data["Grand Total"] - newCases
    };
  });

  const title = locationName
    ? `${
        props.stat === "confirmed" ? "Confirmed cases" : "Deaths"
      } in ${locationName}`
    : "No data reported";

  return (
    <div>
      <RenderChart reportView={props.reportView} title={title}>
        <BarChart
          barSize={50}
          width={props.reportView ? window.innerWidth * 0.9 : undefined}
          height={880}
          data={finalData}
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
          <Bar
            dataKey="New"
            stackId="data"
            shape={<StripedFill fill={props.stat === "dead" ? "#111" : "#CB2727"} />}
          />
          <Bar dataKey="Existing" stackId="data" fill={props.stat === "dead" ? "#111" : "#900000"} />
          <Legend content={<CustomLegend stat={props.stat}/>} />
        </BarChart>
      </RenderChart>
    </div>
  );
};

const CustomLegend = (props: any) => (
  <div style={{ textAlign: "center" }}>
    <span
      style={{
        display: "inline-block",
        height: "10px",
        width: "10px",
        backgroundColor: props.stat === "dead" ? "#111" : "#900000",
        margin: "0 5px 0 10px"
      }}
    ></span>
    Existing Cases
    <span
      style={{
        display: "inline-block",
        height: "10px",
        width: "10px",
        background: `repeating-linear-gradient(
                      135deg,
                      ${props.stat === "dead" ? "#111" : "#CB2727"},
                      ${props.stat === "dead" ? "#111" : "#CB2727"} 2px,
                      #FFFFFF 2px,
                      #FFFFFF 4px
                    )`,
        margin: "0 5px 0 10px"
      }}
    ></span>
    New Cases
  </div>
);
