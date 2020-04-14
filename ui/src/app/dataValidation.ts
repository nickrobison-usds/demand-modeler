import { CovidDateData, County } from "./AppStore";
import { getCountyName, getStateAbr, getStateName, getPopulation, isState } from "../utils/fips";
import { names } from "../utils/fips/names";
import { isSameDay, shortDate } from "../utils/DateUtils";


const casesMustIncrease = (covidDateData: CovidDateData): RuleResult => {
  const min = 50;
  const issues: Issues = [];
  // Counties
  const counties = Object.entries(covidDateData.counties);
  counties.forEach(([fips, countyData]) => {
    countyData.sort((a, b) => (a.Reported > b.Reported ? 1 : -1));
    countyData.forEach((today, i) => {
      const tomorrow = countyData[i + 1];
      if (!tomorrow) return;
      if (
        tomorrow.Confirmed <= today.Confirmed &&
        today.Confirmed > min &&
        !isState(fips)
      ) {
        const countyName = getCountyName(fips);
        issues.push([
          tomorrow.Reported,
          `${today.Confirmed}`,
          `${tomorrow.Confirmed}`,
          `${countyName}`,
          `${getStateName(fips)}`,
          `${fips}`
        ]);
      }
    });
  });

  issues.sort((a, b) => {
    const date = b[0].getTime() - a[0].getTime();
    const value = parseInt(b[2]) - parseInt(a[2])
    return date === 0 ? value : date;
  });

  const total = issues.length;
  return {
    total,
    rule: "Counties with Non-increasing Cases",
    headers: [
      "Reported",
      "Existing Value",
      "New Value",
      "County",
      "State",
      "FIPS"
    ],
    issues: issues
  };
};

const deathsMustIncrease = (covidDateData: CovidDateData): RuleResult => {
  const min = 10;
  const issues: Issues = [];
  // Counties
  const counties = Object.entries(covidDateData.counties);
  counties.forEach(([fips, countyData]) => {
    countyData.sort((a, b) => (a.Reported > b.Reported ? 1 : -1));
    countyData.forEach((today, i) => {
      const tomorrow = countyData[i + 1];
      if (!tomorrow) return;
      if (
        tomorrow.Dead <= today.Dead &&
        today.Dead > min &&
        !isState(fips)
      ) {
        const countyName = getCountyName(fips);
        issues.push([
          tomorrow.Reported,
          `${today.Dead}`,
          `${tomorrow.Dead}`,
          `${countyName}`,
          `${getStateName(fips)}`,
          `${fips}`
        ]);
      }
    });
  });

  issues.sort((a, b) => {
    const date = b[0].getTime() - a[0].getTime();
    const value = parseInt(b[2]) - parseInt(a[2])
    return date === 0 ? value : date;
  });

  const total = issues.length;
  return {
    total,
    rule: "Counties with Non-increasing Deaths",
    headers: [
      "Reported",
      "Existing Value",
      "New Value",
      "County",
      "State",
      "FIPS"
    ],
    issues: issues
  };
};


const abnormalCaseChange = (covidDateData: CovidDateData): RuleResult => {
  const issues: Issues = [];
  const tooLargeIncreaseFactor = 1.4;
  const abnormalIncreaseThreshold = 50;

  // Counties
  const counties = Object.entries(covidDateData.counties);
  counties.forEach(([fips, countyData]) => {
    countyData.sort((a, b) => (a.Reported > b.Reported ? 1 : -1));
    countyData.forEach((today, i) => {
      const tomorrow = countyData[i + 1];
      if (!tomorrow) return;
      if (
        (tomorrow.Confirmed > today.Confirmed * tooLargeIncreaseFactor) &&
        today.Confirmed > abnormalIncreaseThreshold &&
        !isState(fips)
      ) {
        const countyName = getCountyName(fips);
        issues.push([
          tomorrow.Reported,
          "Confirmed",
          `${today.Confirmed}`,
          `${tomorrow.Confirmed}`,
          `${countyName}, ${getStateAbr(fips)}`,
          `${fips}`
        ]);
      }
    });
  });

  issues.sort((a, b) => {
    const date = b[0].getTime() - a[0].getTime();
    const value = parseInt(b[3]) - parseInt(a[3])
    return date === 0 ? value : date;
  });

  const total = issues.length;
  return {
    total,
    rule: `Counties with > ${abnormalIncreaseThreshold} Cases and Have Increased by a Factor of ${tooLargeIncreaseFactor}`,
    headers: [
      "Reported",
      "Stat",
      "Existing Value",
      "New Value",
      "name",
      "fips"
    ],
    issues: issues,
  };
};


const abnormalDeathChange = (covidDateData: CovidDateData): RuleResult => {
  const issues: Issues = [];
  const tooLargeIncreaseFactor = 1.4;
  const abnormalIncreaseThreshold = 10;

  // Counties
  const counties = Object.entries(covidDateData.counties);
  counties.forEach(([fips, countyData]) => {
    countyData.sort((a, b) => (a.Reported > b.Reported ? 1 : -1));
    countyData.forEach((today, i) => {
      const tomorrow = countyData[i + 1];
      if (!tomorrow) return;
      if (
        (tomorrow.Dead > today.Dead * tooLargeIncreaseFactor) &&
        today.Dead > abnormalIncreaseThreshold &&
        !isState(fips)
      ) {
        const countyName = getCountyName(fips);
        issues.push([
          tomorrow.Reported,
          "Dead",
          `${today.Dead}`,
          `${tomorrow.Dead}`,
          `${countyName}, ${getStateAbr(fips)}`,
          `${fips}`
        ]);
      }
    });
  });

  issues.sort((a, b) => {
    const date = b[0].getTime() - a[0].getTime();
    const value = parseInt(b[3]) - parseInt(a[3])
    return date === 0 ? value : date;
  });

  const total = issues.length;
  return {
    total,
    rule: `Counties with > ${abnormalIncreaseThreshold} Deaths and Have Increased by a Factor of ${tooLargeIncreaseFactor}`,
    headers: [
      "Reported",
      "Stat",
      "Existing Value",
      "New Value",
      "name",
      "fips"
    ],
    issues: issues,
  };
};

const suspiciousCountiesEqual = (covidDateData: CovidDateData): RuleResult => {
  const minCases = 50;
  const issues: Issues = [];
  const equalConfirmations: { [key: string]: County[] } = {};

  Object.values(covidDateData.counties).forEach(countyData => {
    countyData.forEach(county => {
      if (county.Confirmed >= minCases) {
        const confirmedkey = `${
          county.Confirmed
        }-${county.Reported.getTime()}-${getStateAbr(county.ID)}`;
        if (equalConfirmations[confirmedkey]) {
          equalConfirmations[confirmedkey].push(county);
        } else {
          equalConfirmations[confirmedkey] = [county];
        }
      }
    });
  });

  Object.values(equalConfirmations)
    .sort((a, b) => {
      const date = b[0].Reported.getTime() - a[0].Reported.getTime();
      return date === 0 ? b[0].Confirmed - a[0].Confirmed : date;
    })
    .forEach(equalCounties => {
      if (equalCounties.length < 2) {
        return;
      }
      issues.push([
        shortDate(equalCounties[0].Reported),
        "Confirmed",
        `${equalCounties[0].Confirmed}`,
        equalCounties
          .map(c => `${c.ID}: ${getCountyName(c.ID)}, ${getStateAbr(c.ID)}`)
          .join(", ")
      ]);
    });

  const total = issues.length;
  return {
    total,
    rule: "Counties with the Same Value on the Same Day",
    headers: ["Reported", "Stat", "Value", "name"],
    issues: issues
  };
};
/**
 * Gets anything where the most recent report is within 14 days, but is
 * missing a more recent report
 * @param covidDateData
 */
const timeseriesMissingDay = (covidDateData: CovidDateData): RuleResult => {
  // 12096e5 = 14 days
  const fortNightAgo = new Date(Date.now() - 12096e5).getTime();
  const oneDay = 86400000;

  const start = fortNightAgo;
  let end = fortNightAgo;

  const covidCounties = Object.values(covidDateData.counties);

  // Add TS to counties
  // find earliest and latest reported case
  const covidDateTimeCounties = covidCounties.map(countyData => {
    return countyData.map(c => {
      const ts = new Date(c["Reported"]).getTime();
      // if (!start || ts < start) {
      //   start = ts;
      // }

      // Grab most recent in current dataset
      if (ts > end) {
        end = ts;
      }
      return { ...c, ts };
    });
  });

  // Create dateRange for date comparisons and timeRange for equivalent ts
  const dateRange: Date[] = [];
  const timeRange: number[] = [];
  for (let d = start; d <= end; d += oneDay) {
    dateRange.push(new Date(d));
    timeRange.push(d);
  }

  const issues: Issues = covidDateTimeCounties
    // only get counties that have reported since we started counting (14 days)
    .filter(c => c[c.length - 1].ts > start)
    .filter(countyData => {
      // Don't report states
      return (
        !isState(countyData[0].ID) &&
        // Don't report counties that have all dates
        !dateRange.reduce((hasAllDates, d) => {
          if (hasAllDates === false) return false;
          return (
            typeof countyData.find(c => isSameDay(c.Reported, d)) != "undefined"
          );
        }, true)
      );
    })
    .map(countyData => {
      // Find most recent missing date
      let notFound = true;
      let i;
      // Count backwards for most recent missing date
      for (i = dateRange.length - 1; i > 0; i--) {
        const localI = i;
        notFound =
          typeof countyData.find(c =>
            isSameDay(c.Reported, dateRange[localI])
          ) == "undefined";
        if (!notFound) {
          break;
        }
      }
      const id = countyData[0].ID;
      // Return issue + ts
      return [
        timeRange[i],
        dateRange[i],
        id,
        `${getCountyName(id)}, ${getStateAbr(id)}`,
        `${getPopulation(id)}`,
        `${countyData.length}`
      ];
    });

  // Sort by ts and cut it off
  issues.sort((a, b) => b[0] - a[0]);
  const sortedIssues = issues.map(e => e.slice(1));

  const total = sortedIssues.length;
  return {
    total,
    rule: "Counties with Missing Data Points",
    headers: [
      "Missing Report",
      "FIPS",
      "Name",
      "Population",
      "Number of Data Points"
    ],
    issues: sortedIssues
  };
};

const countyFIPSMissing = (covidDateData: CovidDateData): RuleResult => {
  const issues: Issues = [];
  const knownFIPS = Object.keys(names).filter(fip => !isState(fip));
  const receivedFIPS = Object.keys(covidDateData.counties);
  const missingFIPS =  knownFIPS.filter(f => !receivedFIPS.includes(f) );

  missingFIPS.forEach(fip => {
    issues.push([
      `${fip}`,
      `${getCountyName(fip)}, ${getStateAbr(fip)}`,
      `${getPopulation(fip)}`
    ])
  });

  issues.sort((a,b) => {
    const population = parseInt(b[2]) - parseInt(a[2])
    return population === 0 ? parseInt(b[0]) - parseInt(a[0]) : population;
  })
  const total = issues.length;
  return {
    total,
    rule: "Known Counties with No Reporting",
    headers: ["FIPS", "Name", "Population"],
    issues: issues
  };
};

const InvalidFIPS = (covidDateData: CovidDateData): RuleResult => {
  const issues: Issues = [];
  const knownFIPS = Object.keys(names).filter(fip => !isState(fip));
  const receivedFIPS = Object.keys(covidDateData.counties);
  const invalidFIPS = receivedFIPS.filter(f => !knownFIPS.includes(f) );

  invalidFIPS.forEach(fip => {
    issues.push([
      `${fip}`,
      `${getCountyName(fip)}, ${getStateAbr(fip)}`,
      `${getPopulation(fip)}`
    ])
  });

  issues.sort((a,b) => {
    const population = parseInt(b[2]) - parseInt(a[2])
    return population === 0 ? parseInt(b[0]) - parseInt(a[0]) : population;
  })

  const total = issues.length;
  return {
    total,
    rule: "Unknown FIPS Value",
    headers: ["FIPS", "Name", "Population"],
    issues: issues,
  };
};

const growthOutliers = (covidDateData: CovidDateData): RuleResult => {
  const issues: Issues = [];
  const numberOfDays = 5;
  const counties = Object.entries(covidDateData.counties);
  counties.forEach(([fips, countyData]) => {
    countyData.sort((a, b) => (a.Reported > b.Reported ? 1 : -1));
    let growth: number[] = [];
    let yesterdayRollingAverage: number;
    countyData.forEach((today, i) => {
      const tomorrow = countyData[i + 1];
      if (!tomorrow) return;
      if (growth.length === numberOfDays) growth = growth.slice(1, numberOfDays);
      growth.push(tomorrow.Confirmed - today.Confirmed);
      // N/A for first four
      if (i < numberOfDays) return;
      const todayGrowth = tomorrow.Confirmed - today.Confirmed;
      if (
        yesterdayRollingAverage !== undefined &&
        todayGrowth > yesterdayRollingAverage &&
        todayGrowth > 0 &&
        today.Confirmed > 50
      ) {
        issues.push([
          tomorrow.Reported,
          "Confirmed",
          `${yesterdayRollingAverage}`,
          `${todayGrowth}`,
          `${today.Confirmed}`,
          `${Math.round((todayGrowth - yesterdayRollingAverage) * 10) / 10}`,
          `${today.ID}: ${getCountyName(today.ID)}, ${getStateAbr(today.ID)}`,
        ]);
      }
      yesterdayRollingAverage =
        growth.reduce((acc, el) => acc + el, 0) / growth.length;
    });
  });

  issues.sort((a, b) => {
    const date = b[0].getTime() - a[0].getTime();
    return date === 0 ? parseInt(b[5]) - parseInt(a[5]) : date;
  });

  const total = issues.length;
  return {
    total,
    rule: `Counties with Outlier Growth Compared to ${numberOfDays} Day Average`,
    headers: [
      "Reported",
      "Stat",
      "5-Day Average Daily Increase",
      "Today's Increase",
      "Today's Amount",
      "Amount Above",
      "name",
    ],
    issues: issues,
  };
};

export const getDataIssues = (covidDateData: CovidDateData): RuleResult[] => {
  const rulesets = [
    casesMustIncrease,
    deathsMustIncrease,
    abnormalCaseChange,
    abnormalDeathChange,
    timeseriesMissingDay,
    suspiciousCountiesEqual,
    countyFIPSMissing,
    InvalidFIPS,
    growthOutliers,
  ];
  const issues = rulesets.reduce((acc, rules) => {
    return acc.concat(rules(covidDateData));
  }, [] as RuleResult[]);
  return issues;
};
