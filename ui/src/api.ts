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

  // USAFacts -> CSBS hack
  const Manhatten = "36061";
  const Bronx = "36005";
  const Queens = "36081";
  const Kings = "36047";
  const Richmond = "36085";
  const today = 0;
  const nyc_combined = [Manhatten, Bronx, Queens, Kings, Richmond];
  const accumulateNYCData = (
    counties: { [fip: string]: County[] },
    countyFips: string[],
    attribute: "Dead" | "Confirmed"
  ) => {
    let total = 0;
    countyFips.forEach(fip => {
      console.log(counties[fip][today][attribute])
      total += counties[fip][today][attribute];
    });
    console.log(attribute, countyFips, total)
    return total;
  };
  counties[Manhatten][today].Confirmed = accumulateNYCData(
    counties,
    nyc_combined,
    "Confirmed"
  );
  counties[Manhatten][today].Dead = accumulateNYCData(
    counties,
    nyc_combined,
    "Dead"
  );

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
