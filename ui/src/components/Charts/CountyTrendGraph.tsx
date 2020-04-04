import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  YAxis,
  Label
} from "recharts";
import { CovidDateData, AppState } from "../../app/AppStore";
import { monthDay } from "../../utils/DateUtils";
import { names } from "../../utils/fips/names";
import { interpolateRainbow } from "d3";
import { RenderChart } from "./RenderChart";

interface Props {
  selection: AppState["selection"];
  timeSeries: CovidDateData;
  chartWidth?: number;
  reportView?: boolean;
}

interface DataPoint {
  Date: string; // Date string
  [countyName: string]: number | string;
}

const MIN_CASES = 20;
const MAX_COUNTIES = 20;

export const CountyTrendGraph = (props: Props) => {
  if (props.selection.county) {
    return null;
  }

  let dates: string[];
  let data: DataPoint[] = [];

  const countyData = Object.keys(props.timeSeries.counties)
    .flatMap(k => props.timeSeries.counties[k])
    .filter(c => c.Confirmed >= MIN_CASES);

  dates = [
    ...new Set(
      countyData.map(({ Reported }) => monthDay(Reported))
    )
  ].sort();

  const counties = countyData.reduce((acc, el) => {
    // Filter if state is selected
    if (props.selection.state && props.selection.state !== el.ID.substr(0, 2)) {
      return acc;
    }


    const name = `${names[el.ID].County}, ${names[el.ID].State}`;
    if (!acc[name]) acc[name] = {};
    acc[name][monthDay(el.Reported).split("|")[1]] = el.Confirmed;
    return acc;
  }, {} as { [c: string]: { [d: string]: number } });

  dates.forEach(d => {
    const date = d.split("|")[1]
    const dataPoint: DataPoint = {
      Date: date
    };
    Object.keys(counties).forEach(key => {
      dataPoint[key] = counties[key][date];
    });
    data.push(dataPoint);
  });

  // Label order based on most recent day
  const lastDay = { ...data[data.length - 1] };
  delete lastDay.Date;
  const labelColors: { [n: string]: string } = Object.entries(lastDay)
    .map(([name], i) => ({
      name,
      color: interpolateRainbow(i / MAX_COUNTIES)
    }))
    .reduce((acc, el) => {
      acc[el.name] = el.color;
      return acc;
    }, {} as { [n: string]: string });

  const labelOrder = Object.entries(lastDay)
    .sort((a, b) => {
      if (a[1] === undefined || b[1] > a[1]) return 1;
      if (b[1] === undefined || a[1] > b[1]) return -1;
      return 0;
    })
    .map(el => el[0]);

  const hiddenCounties = Math.max(labelOrder.length - MAX_COUNTIES, 0);

  return (
    <>
      <RenderChart
        reportView={props.reportView}
        title="Counties with 20+ reported cases"
      >
        <LineChart
          width={props.reportView ? window.innerWidth * 0.9 : undefined}
          height={600}
          data={data}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <XAxis dataKey="Date" />
          <YAxis type="number" scale="linear">
            <Label
              dx={-5}
              angle={-90}
              value="Confirmed cases"
              position="insideLeft"
              style={{ textAnchor: "middle" }}
            />
          </YAxis>
          <Tooltip />
          <CartesianGrid stroke="#f5f5f5" />
          {labelOrder.slice(0, MAX_COUNTIES).map((e, i) => (
            <Line
              key={e}
              dataKey={e}
              stroke={labelColors ? labelColors[e as any] : "#000"}
              strokeWidth={2}
              dot={false}
            />
          ))}
          {props.reportView && (
            <Legend
              content={
                <>
                  <CustomLegend
                    labelColors={labelColors}
                    labels={labelOrder.slice(0, MAX_COUNTIES)}
                  />
                  {hiddenCounties > 0 && <div>+{hiddenCounties} more</div>}
                </>
              }
            />
          )}
        </LineChart>
      </RenderChart>
    </>
  );
};

type LegendProps = {
  labelColors: { [n: string]: string };
  labels: string[];
};

const CustomLegend: React.FC<LegendProps> = ({ labelColors, labels }) => {
  const LABEL_COLUMNS = 4;
  const labelsPerColumn = Math.ceil(labels.length / LABEL_COLUMNS);
  const labelGroups = labels.reduce((acc, el, i) => {
    if (i % labelsPerColumn === 0) {
      acc.push([]);
    }
    acc[acc.length - 1].push(el);
    return acc;
  }, [] as string[][]);
  let index = 1;
  return (
    <>
      <p>Counties</p>
      <div style={{ display: "flex", marginTop: "5px" }}>
        {labelGroups.map(group => (
          <div key={group[0][0]} style={{ flex: "1 1 0px" }}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {group.map(label => (
                <li key={label} style={{ marginBottom: "5px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      height: "10px",
                      width: "10px",
                      marginRight: "5px",
                      backgroundColor: labelColors[label]
                    }}
                  ></span>
                  {index++}. {label}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
};
