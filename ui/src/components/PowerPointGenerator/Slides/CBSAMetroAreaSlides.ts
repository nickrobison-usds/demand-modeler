import pptxgen from "pptxgenjs";
import { County } from "../../../app/AppStore";
import {
  addStackedBarChartWithTitle,
  StackedBarData
} from "./Templates/InteriorSlides/StackedBarChartWithTitle";
import { isSameDay } from "../../../utils/DateUtils";
import { getCountyName, getStateAbr } from "../../../utils/fips";

export const metroAreas: { area: string; fipsCodes: string[] }[] = [
  {
    area: "Seattle, WA",
    fipsCodes: ["53053", "53061", "53033"]
  },
  {
    area: "Detroit, MI",
    fipsCodes: ["26125", "26163"]
  },
  {
    area: "New York, NY",
    fipsCodes: ["36061", "34003", "36059", "36119", "36087", "34037"].reverse()
  },
  // if value = 36061 and date is note today add 36005, 36081,36047, and 36085
  {
    area: "Chicago, IL",
    fipsCodes: ["17031"]
  },
  {
    area: "New Orleans, LA",
    fipsCodes: ["22051", "22071"]
  },
  {
    area: "Los Angeles, CA",
    fipsCodes: ["06111", "06071", "06059", "06065", "06037"]
  }
];

export const getConfirmedColors = (length: number): string[] => {
  switch (length) {
    default:
    case 6:
      return [
        "160004",
        "52000F",
        "910A0A",
        "B8051A",
        "DE0029",
        "EF8094"
      ].reverse();
    case 5:
      return ["160004", "52000F", "910A0A", "DE0029", "EF8094"].reverse();
    case 3:
      return ["DE0029", "910A0A", "52000F"];
    case 2:
      return ["DE0029", "910A0A"];
    case 1:
      return ["910A0A"];
  }
};

export const getDeadColors = (length: number): string[] => {
  switch (length) {
    default:
    case 6:
      return [
        "032E41",
        "285266",
        "4D768A",
        "729BAF",
        "97BFD3",
        "DEF1FC"
      ].reverse();
    case 5:
      return ["032E41", "315B6F", "60899D", "8EB6CA", "BCE3F8"].reverse();
    case 3:
      return ["BCE3F8", "33689A", "032E41"];
    case 2:
      return ["BCE3F8", "33689A"];
    case 1:
      return ["33689A"];
  }
};

const accumulateNYCData = (
  counties: { [fip: string]: County[] },
  countyFips: string[],
  index: number,
  attribute: "Dead" | "Confirmed"
) => {
  let total = 0;
  countyFips.forEach(fip => {
    const entry = counties[fip][index];
    if (entry) {
      total += counties[fip][index][attribute];
    }
  });
  return total;
};

const getCountyData = (
  counties: { [fip: string]: County[] },
  countyFips: string[],
  stat: Stat,
  daily = false
) => {
  return [...countyFips]
    .reverse()
    .map(fips => {
      if (fips === "36061") {
        const nyc_combined = ["36061", "36005", "36081", "36047", "36085"];
        return counties[fips].map((county, index) => {
          var today = new Date();
          if (isSameDay(county.Reported, today)) {
            return county;
          }
          return {
            ...county,
            Dead: accumulateNYCData(counties, nyc_combined, index, "Dead"),
            Confirmed: accumulateNYCData(
              counties,
              nyc_combined,
              index,
              "Confirmed"
            )
          };
        });
      } else {
        return counties[fips];
      }
    })
    .reduce((acc, county) => {
      const data: StackedBarData = {
        name: getCountyName(county[0].ID) + ", " + getStateAbr(county[0].ID),
        labels: [],
        values: []
      };

      // Data comes in in reverse chronological order
      const orderedCounties = [...county].reverse();

      orderedCounties.forEach((el, i) => {
        data.labels.push(
          el.Reported.getMonth() + 1 + "/" + el.Reported.getDate()
        );
        let value = el[stat === "confirmed" ? "Confirmed" : "Dead"];
        if (daily && orderedCounties[i - 1]) {
          value = Math.max(
            value -
              orderedCounties[i - 1][
                stat === "confirmed" ? "Confirmed" : "Dead"
              ],
            0
          );
        }
        data.values.push(value);
      });
      // The first day is only used to calculate diffs. Remove it.
      data.labels.shift();
      data.values.shift();
      acc.push(data);
      return acc;
    }, [] as StackedBarData[]);
};

const addCountySlide = (
  ppt: pptxgen,
  counties: { [fip: string]: County[] },
  metroArea: string,
  countyFips: string[],
  stat: Stat,
  daily = false
) => {
  const countyData = getCountyData(counties, countyFips, stat, daily);

  const confirmedColors = getConfirmedColors(countyFips.length);
  const deadColors = getDeadColors(countyFips.length);

  const barColors = stat === "confirmed" ? confirmedColors : deadColors;
  addStackedBarChartWithTitle(
    ppt,
    `${metroArea} Metro Area: Confirmed ${
      stat === "confirmed" ? "Cases" : "Deaths"
    }${daily ? " Daily" : ""}`,
    countyData,
    `Confirmed ${stat === "confirmed" ? "cases" : "deaths"}`.toUpperCase(),
    barColors
  );
};

export const addCBSAMetroAreaSlides = (
  ppt: pptxgen,
  counties: { [fip: string]: County[] }
) => {
  metroAreas.forEach(metroArea => {
    const { area, fipsCodes } = metroArea;
    addCountySlide(ppt, counties, area, fipsCodes, "confirmed");
    addCountySlide(ppt, counties, area, fipsCodes, "confirmed", true);
    addCountySlide(ppt, counties, area, fipsCodes, "dead");
    addCountySlide(ppt, counties, area, fipsCodes, "dead", true);
  });
};
