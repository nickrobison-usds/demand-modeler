import React from "react";
import {
  AreaChart,
  Area,
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

interface Props {
  state?: string;
  county?: string;
  timeSeries: CovidDateData;
  stat: "confirmed" | "dead";
  reportView?: boolean;
  chartWidth?: number;
}

export const StackedArea = (props: Props) => {
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
      const state = props.timeSeries.states[props.state][0].State;

      const counties = Object.values(props.timeSeries.counties)
        .flat()
        .filter(({ State }) => State === state);

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
      if (data[i].Name.split("|")[0] === data[i + 1].Name.split("|")[0]) {
        continue;
      }
    }
    data[i].Name = data[i].Name.split("|")[0];
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
    const newCases = data["Grand Total"] - dedupedData[i - 1]["Grand Total"];
    return {
      ...data,
      New: newCases,
      Existing: data["Grand Total"] - newCases
    };
  });

  console.log(finalData);

  return (
    <div>
      <h3>
        {locationName ? (
          <>Confirmed cases in {locationName}</>
        ) : (
          <>No data reported</>
        )}
      </h3>
      <RenderChart reportView={props.reportView}>
        <AreaChart
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
          <Area type="linear" dataKey="New" stackId="data" stroke="#CB2727" strokeWidth="3" fill="#CB2727" fillOpacity="0" />
          <Area type="linear" dataKey="Existing" stackId="data" stroke="#900000" strokeWidth="3" fill="#900000" fillOpacity="0" />
          <Legend />
        </AreaChart>
      </RenderChart>
    </div>
  );
  };
