import React from "react";
import { LineChart, Line, XAxis, CartesianGrid, Tooltip } from "recharts";
import { CovidDateData } from "../../app/AppStore";
import { stateAbbreviation } from "../../utils/stateAbbreviation";
import { monthDay } from "../../utils/DateUtils";

interface Props {
  timeSeries: CovidDateData;
};

interface DataPoint {
  Date: string; // Date string
  [countyName: string]: number | string;
}
const colors = [
  "#E5A3A3",
  "#D05C5C",
  "#CB2727",
  "#C00000",
  "#900000",
  "#700000"
];

const MIN_CASES = 20;

export const CountyTrendGraph = (props: Props) => {
  let title: string;
  let dates: string[];
  let data: DataPoint[] = [];
  let stateName: string = "";

  // Top 10 Counties (total or in state)
  title = `Counties with the highest number of cases`;

  const countyData = Object.keys(props.timeSeries.counties).flatMap(
    k => props.timeSeries.counties[k]
  ).filter(c => c.Confirmed >= 20);

  dates = [
    ...new Set(countyData.map(({ Reported }) => monthDay(Reported)))
  ].sort();
  console.log(dates)
  const counties = countyData.reduce((acc, el) => {
    const name = `${el.County}, ${stateAbbreviation[el.State]}`;
    if (!acc[name]) acc[name] = {};
    acc[name][monthDay(el.Reported)] = el.Confirmed;
    return acc;
  }, {} as { [c: string]: { [d: string]: number } });

  console.log(counties)


  // const data = [{name: 'Page A', uv: 400, pv: 2400, amt: 2400}, ...];
  dates.forEach((date) => {
    const dataPoint: DataPoint = {
      Date: date
    };
    Object.keys(counties).forEach(key => {
      dataPoint[key] = counties[key][date];
    });
    data.push(dataPoint);
  });
  console.log(data)
  // data = Object.entries(counties).reduce((acc, [Name, data]) => {
  //   acc.push({
  //     Name,
  //     ...data
  //   });
  //   return acc;
  // }, [] as { [k: string]: string | number }[]).sort(
  //   (a, b) => {
  //     const lastIndex = dates.length - 1;
  //     return (b[dates[lastIndex]] as number || 0) - (a[dates[lastIndex]] as number || 0)
  //   }
  // );

  // const dedupedData: any[] = [];
  // data.forEach(e => {
  //   const dedupedElement: any = {};
  //   const d = Object.keys(e).sort();
  //   for (let i = 0; i < d.length; i++) {
  //     const key = d[i];
  //     if (!key.toString().includes("|")) {
  //       dedupedElement[key] = e[key];
  //       continue;
  //     }
  //     if (d[i+1]) {
  //       if (d[i].toString().split("|")[0] === d[i+1].toString().split("|")[0]) {
  //         continue;
  //       }
  //     }
  //     dedupedElement[d[i].toString().split("|")[0]] = e[key];
  //   }
  //   dedupedData.push(dedupedElement);
  // });

  // const displayDates: string[] = []
  // const displayDateSet = new Set();
  // dates.forEach(d => {
  //   const key = d.split("|")[0];
  //   if (!displayDateSet.has(key)) {
  //     displayDates.push(key)
  //     displayDateSet.add(key);
  //   }
  // });

  return (
    <>
      <h3>Reported Cases in Counties with 20+ cases</h3>
      <LineChart
        width={400}
        height={400}
        data={data}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <XAxis dataKey="Date" />
        <Tooltip />
        <CartesianGrid stroke="#f5f5f5" />
        {Object.keys(counties).map(e =>
          <Line type="monotone" dataKey={e} stroke="#ff7300" yAxisId={e} />
        )}
      </LineChart>
    </>
  );
};
