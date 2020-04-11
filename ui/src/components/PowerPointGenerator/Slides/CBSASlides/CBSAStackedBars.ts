import pptxgen from "pptxgenjs";
import { County } from "../../../../app/AppStore";
import { addMultiStackedBarChartWithTitle } from "../Templates/InteriorSlides/StackedBarChartWithTitle";
import { getCountyName, getStateAbr } from "../../../../utils/fips";
import { cbsaCodes } from "./cbsaCodes";
import * as fipsUtils from "../../../../utils/fips";
import { addBlankSlideWithTitle } from "../Templates/InteriorSlides/BlankWithTitle";
import { CSBAOrderedByStat, getCSBATotal, getLatestCounty } from "./Utils";
import { slides } from "./multiCbsaPerSlide";

const OTHER_THRESHOLD = 0.01;

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
  },
  {
    area: "Boston, MA",
    fipsCodes: ["25021", "25025", "25017", "25023", "25009"]
  },
  {
    area: "Washington, DC",
    fipsCodes: ["11001", "24031", "24033", "24017", "24021", "24009"]
  },
  {
    area: "Baltimore, MD",
    fipsCodes: ["24005", "24510", "24003", "24027", "24013", "24025", "24035"]
  },
  {
    area: "Hailey, ID",
    fipsCodes: ["16013", "16025", "16063"]
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

const getCountyData = (
  counties: { [fip: string]: County[] },
  countyFips: string[],
  stat: Stat,
  cbsaId?: string,
  daily = false
) => {
  const totalConfirmed = cbsaId
    ? getCSBATotal(counties, cbsaId, "Confirmed")
    : 1;
  const cleanCountyFips = [...countyFips]
    .map(fips => {
      if (counties[fips] === undefined) {
        return [];
      }
      return counties[fips];
    })
    .sort((a, b) => {
      return getLatestCounty(b)?.Confirmed - getLatestCounty(a)?.Confirmed;
    });

  const countiesToKeep = cleanCountyFips.filter(
    el => getLatestCounty(el)?.Confirmed / totalConfirmed >= OTHER_THRESHOLD
  );
  const otherCounties = cleanCountyFips.filter(
    el => getLatestCounty(el)?.Confirmed / totalConfirmed < OTHER_THRESHOLD
  );
  const otherTimeseries: County[] = [];
  otherCounties.forEach(timeseries =>
    timeseries.forEach((county, index) => {
      if (otherTimeseries[index]) {
        otherTimeseries[index][stat === "confirmed" ? "Confirmed" : "Dead"] +=
          county[stat === "confirmed" ? "Confirmed" : "Dead"];
      } else {
        otherTimeseries[index] = { ...county };
        otherTimeseries[index].ID = "other";
      }
    })
  );

  const numberOfOthers = otherCounties.length;
  const combinedCounties =
    numberOfOthers > 1
      ? [...countiesToKeep, otherTimeseries]
      : [...countiesToKeep];
  const getName = (county: County[]) => {
    if (county[0].ID === "other") {
      return `${numberOfOthers} Other${numberOfOthers > 2 ? "s" : ""}`;
    }
    return county[0]
      ? getCountyName(county[0].ID) + ", " + getStateAbr(county[0].ID)
      : "";
  };
  return combinedCounties.reduce((acc, county) => {
    const data: ChartData = {
      name: getName(county),
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
        const previous =
          orderedCounties[i - 1][stat === "confirmed" ? "Confirmed" : "Dead"];

        value = Math.max(value - previous, 0);
      }
      data.values.push(value);
    });
    // The first day is only used to calculate diffs. Remove it.
    data.labels.shift();
    data.values.shift();
    acc.push(data);
    return acc;
  }, [] as ChartData[]);
};

const addCountySlide = (
  ppt: pptxgen,
  counties: { [fip: string]: County[] },
  metroArea: string | string[],
  countyFips: string[][],
  stat: Stat,
  cbsaId?: string | string[],
  daily = false
) => {
  const countyData = countyFips.map((fips, i) => {
    if (!cbsaId || typeof cbsaId === "string") {
      return getCountyData(counties, fips, stat, cbsaId, daily)
    } else {
      return getCountyData(counties, fips, stat, cbsaId[i], daily)
    }
  });
  const maxNumberOfCounties = countyData.reduce(
    (acc, el) => (acc > el.length ? acc : el.length),
    0
  );

  const confirmedColors = getConfirmedColors(maxNumberOfCounties);
  const deadColors = getDeadColors(maxNumberOfCounties);

  const barColors = stat === "confirmed" ? confirmedColors : deadColors;
  let firstCounties: string[] = countyFips
    .map(fips =>
      fips.length > 1 ? "" : `(${fipsUtils.getCountyName(fips[0])})`
    )
    .filter(el => el !== "");
  const title = `Confirmed ${stat === "confirmed" ? "Cases" : "Deaths"}${
    daily ? " Daily" : ""
  }${
    typeof metroArea === "string"
      ? " in " + metroArea + " " + firstCounties.join(", ")
      : ""
  }`;
  addMultiStackedBarChartWithTitle(
    ppt,
    title,
    countyData,
    `Confirmed ${stat === "confirmed" ? "cases" : "deaths"}`.toUpperCase(),
    barColors,
    countyFips.length > 1,
    typeof metroArea === "object" ? metroArea : undefined
  );
};

export const addSelectCBSASlides = (
  ppt: pptxgen,
  counties: { [fip: string]: County[] }
) => {
  addBlankSlideWithTitle(ppt, "Select Metropolitan areas");
  metroAreas.forEach(code => {
    const { area, fipsCodes } = code;
    addCountySlide(ppt, counties, area, [fipsCodes], "confirmed", undefined);
    addCountySlide(
      ppt,
      counties,
      area,
      [fipsCodes],
      "confirmed",
      undefined,
      true
    );
    addCountySlide(ppt, counties, area, [fipsCodes], "dead", undefined);
    addCountySlide(ppt, counties, area, [fipsCodes], "dead", undefined, true);
  });
};

export const addTop25CBSAByConfirmed = (
  ppt: pptxgen,
  counties: { [fip: string]: County[] }
) => {
  addBlankSlideWithTitle(ppt, "Top 25 CBSA ordered by Total Confirmed cases");

  CSBAOrderedByStat(counties, "Confirmed", 25, []).forEach(id => {
    const { name, fips } = cbsaCodes[id];
    addCountySlide(ppt, counties, name, [fips], "confirmed", id);
    addCountySlide(ppt, counties, name, [fips], "confirmed", id, true);
    addCountySlide(ppt, counties, name, [fips], "dead", id);
    addCountySlide(ppt, counties, name, [fips], "dead", id, true);
  });
};

export const addMultiCBSAStackedBarSlides = (
  ppt: pptxgen,
  counties: { [fip: string]: County[] }
) => {
  addBlankSlideWithTitle(ppt, "Select CBSA clusters");
  slides.forEach(fipsAreas => {
    const fips = fipsAreas.map(code => cbsaCodes[code].fips);
    const names = fipsAreas.map(code => cbsaCodes[code].name);
    addCountySlide(ppt, counties, names, fips, "confirmed", fipsAreas);
    addCountySlide(ppt, counties, names, fips, "confirmed", fipsAreas, true);
    addCountySlide(ppt, counties, names, fips, "dead", fipsAreas);
    addCountySlide(ppt, counties, names, fips, "dead", fipsAreas, true);
  });
};
