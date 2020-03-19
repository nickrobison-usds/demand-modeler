import React, { useContext } from "react";
import Card from "./Card/Card";
import { AppContext, CovidStats, CovidDateData } from "../app/AppStore";
import { getPreviousDate, parseDate, isSameDate } from "../utils/DateUtils";

interface Stats {
  c?: number;
  d?: number;
}

interface Props {
  stat: "confirmed" | "dead";
}

const getCountiesForState = (
  covidTimeSeries: CovidDateData,
  date: Date,
  stateID: string
): CovidStats[] => {
  const seen = new Set<string>();
  const stateName = covidTimeSeries.states[stateID][0].State;
  return Object.values(covidTimeSeries.counties)
    .flat()
    .filter(({ State, Reported }) => {
      return State === stateName && isSameDate(Reported, date);
    });
};

const countCases = (data: CovidStats[]): Stats => {
  let c = 0;
  let d = 0;
  data.forEach((stats: CovidStats) => {
    c += stats.Confirmed;
    d += stats.Dead;
  });
  return { c, d };
};

const USATotal: React.FunctionComponent<Props> = props => {
  const {
    state: {
      covidTimeSeries,
      selection: { date, state, county }
    }
  } = useContext(AppContext);

  const selectedDate = new Date(parseDate(date));
  let currentStats: Stats;
  let previousStats: Stats;
  const previousDate = getPreviousDate(selectedDate);
  if (county !== undefined) {
    currentStats = {
      c: covidTimeSeries.counties[county].find(({ Reported }) =>
        isSameDate(Reported, selectedDate)
      )?.Confirmed,
      d: covidTimeSeries.counties[county].find(({ Reported }) =>
        isSameDate(Reported, selectedDate)
      )?.Dead
    };
    previousStats = {
      c: covidTimeSeries.counties[county].find(({ Reported }) =>
        isSameDate(Reported, previousDate)
      )?.Confirmed,
      d: covidTimeSeries.counties[county].find(({ Reported }) =>
        isSameDate(Reported, previousDate)
      )?.Dead
    };
  } else if (state !== undefined) {
    getCountiesForState(covidTimeSeries, selectedDate, state);
    currentStats = countCases(
      getCountiesForState(covidTimeSeries, selectedDate, state)
    );
    previousStats = countCases(
      getCountiesForState(covidTimeSeries, previousDate, state)
    );
  } else {
    const seen = new Set<string>();
    currentStats = countCases(
      Object.values(covidTimeSeries.states)
        .flat()
        .filter(({ Reported }) => {
          return isSameDate(Reported, selectedDate);
        })
    );
    previousStats = countCases(
      Object.values(covidTimeSeries.states)
        .flat()
        .filter(({ Reported }) => {
          return isSameDate(Reported, previousDate);
        })
    );
  }

  const { c: confirmed, d: dead } = currentStats;
  const { c: previousConfirmed, d: previousDead } = previousStats;

  const renderChange = (
    current: number | undefined,
    previous: number | undefined
  ): string | null => {
    if (current === undefined || previous === undefined) {
      return null;
    }
    const change = current - previous;
    return `${change >= 0 ? "+" : ""}${change}`;
  };

  return (
    <div style={{ display: "flex", textAlign: "center" }}>
      {props.stat === "confirmed" ? (
        <Card header="Total">
          {confirmed} ({renderChange(confirmed, previousConfirmed)})
        </Card>
      ) : (
        <Card header="Total">
          {dead} ({renderChange(dead, previousDead)})
        </Card>
      )}
    </div>
  );
};

export default USATotal;
