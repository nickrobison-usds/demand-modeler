import Axios from "axios";
import { County, State } from "./app/AppStore";

export interface StateIDs {
  [name: string]: number;
}

interface StateResponse {
  ID: string;
  Reported: string;
  Confirmed: number;
  Dead: number;
}

interface CountyResponse {
  ID: string;
  Reported: string;
  Confirmed: number;
  Dead: number;
}

const parseDate = (d: string) => {
  const date = new Date(d.split("T")[0]);
  date.setDate(date.getDate() + 1);
  return date;
};

export async function getCountyCases(
  start?: Date,
  end?: Date
): Promise<{ [key: string]: County[] }> {
  const url = new URL(`/api/county`, window.location.origin);
  if (start) {
    url.searchParams.append("start", start.toISOString());
  }
  if (end) {
    url.searchParams.append("end", end.toISOString());
  }

  let counties: { [key: string]: County[] } = {};

  const resp = await Axios.get<CountyResponse[]>(url.href);
  resp.data
    .map(
      (s: CountyResponse): County => {
        return {
          ...s,
          Reported: parseDate(s.Reported),
          mortalityRate: s.Dead / s.Confirmed
        };
      }
    )
    .forEach(county => {
      let c = counties[county.ID];
      if (c) {
        c.push(county);
      } else {
        c = [county];
      }
      counties[county.ID] = c;
    });
  return counties;
}

export async function getStateCases(
  start?: Date,
  end?: Date
): Promise<{ [key: string]: State[] }> {
  const url = new URL(`/api/state`, window.location.origin);
  if (start) {
    url.searchParams.append("start", start.toISOString());
  }
  if (end) {
    url.searchParams.append("end", end.toISOString());
  }

  let states: { [key: string]: State[] } = {};

  const resp = await Axios.get<StateResponse[]>(url.href);
  resp.data
    .map(
      (s: StateResponse): State => {
        return {
          ...s,
          Reported: parseDate(s.Reported),
          ID: s.ID + "000",
          mortalityRate: s.Dead / s.Confirmed
        };
      }
    )
    .forEach(state => {
      let s = states[state.ID];
      if (s) {
        s.push(state);
      } else {
        s = [state];
      }
      states[state.ID] = s;
    });

  return states;
}
