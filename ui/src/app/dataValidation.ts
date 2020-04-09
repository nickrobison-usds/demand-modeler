import { CovidDateData, County } from "./AppStore";
import { getCountyName, getStateAbr, getPopulation } from "../utils/fips";
import { names } from "../utils/fips/names";
import { isSameDay } from "../utils/DateUtils";

type RuleResult = {
  rule: string;
  headers: string[];
  issues: string[][];
};

const shortDate = (date: Date) => date.getMonth() + 1 + "/" + date.getDate();

const casesMustIncrease = (covidDateData: CovidDateData): RuleResult => {
  const issues: string[][] = [];
  // Counties
  const counties = Object.entries(covidDateData.counties);
  counties.forEach(([fips, countyData]) => {
    countyData.sort((a, b) => (a.Reported > b.Reported ? 1 : -1));
    countyData.forEach((today, i) => {
      const tomorrow = countyData[i + 1];
      if (!tomorrow) return;
      if (tomorrow.Confirmed < today.Confirmed) {
        const countyName = getCountyName(fips);
        issues.push([
          `${shortDate(today.Reported)}`,
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
    const date = b[0] > a[0] ? 1 : b[0] === a[0] ? 0 : -1;
    return date === 0 ? parseInt(b[3]) - parseInt(a[3]) : date;
  });

  return {
    rule: "Counties with Non-increasing Data",
    headers: [
      "Reported",
      "Stat",
      "Existing Value",
      "New Value",
      "name",
      "fips"
    ],
    issues: issues.splice(0, 25)
  };
};

const casesMustPositive = (covidDateData: CovidDateData): RuleResult => {
  const issues: string[][] = [];
  // Counties
  const counties = Object.entries(covidDateData.counties);
  counties.forEach(([fips, countyData]) => {
    countyData.forEach(today => {
      if (today.Confirmed < 0) {
        const countyName = getCountyName(fips);
        issues.push([
          `${shortDate(today.Reported)}`,
          "Confirmed",
          `${today.Confirmed}`,
          `${countyName}, ${getStateAbr(fips)}`,
          `${fips}`
        ]);
      }
    });
  });

  issues.sort((a, b) => {
    const date = b[0] > a[0] ? 1 : b[0] === a[0] ? 0 : -1;
    return date === 0 ? parseInt(b[3]) - parseInt(a[3]) : date;
  });

  return {
    rule: "Counties with Negative Data",
    headers: ["Reported", "Stat", "Value", "name", "fips"],

    issues: issues.splice(0, 25)
  };
};

const abnormalCaseChange = (covidDateData: CovidDateData): RuleResult => {
  const issues: string[][] = [];
  const tooLargeIncreaseFactor = 3;
  const abnormalIncreaseThreshold = 50;

  // Counties
  const counties = Object.entries(covidDateData.counties);
  counties.forEach(([fips, countyData]) => {
    countyData.sort((a, b) => (a.Reported > b.Reported ? 1 : -1));
    countyData.forEach((today, i) => {
      const tomorrow = countyData[i + 1];
      if (!tomorrow) return;
      if (
        (tomorrow.Confirmed > today.Confirmed * tooLargeIncreaseFactor ||
          tomorrow.Confirmed === today.Confirmed) &&
        today.Confirmed > abnormalIncreaseThreshold
      ) {
        const countyName = getCountyName(fips);
        issues.push([
          `${shortDate(today.Reported)}`,
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
    const date = b[0] > a[0] ? 1 : b[0] === a[0] ? 0 : -1;
    return date === 0 ? parseInt(b[3]) - parseInt(a[3]) : date;
  });

  return {
    rule: `Counties with > ${abnormalIncreaseThreshold} Cases and Have Increase by a Factor of ${tooLargeIncreaseFactor}`,
    headers: [
      "Reported",
      "Stat",
      "Existing Value",
      "New Value",
      "name",
      "fips"
    ],
    issues: issues.splice(0, 25)
  };
};

const suspiciousCountiesEqual = (covidDateData: CovidDateData): RuleResult => {
  const minCases = 25;
  const issues: string[][] = [];
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

  return {
    rule: "Counties with the Same Value on the Same Day",
    headers: ["Reported", "Stat", "Value", "name"],
    issues: issues.splice(0, 25)
  };
};

const timeseriesMissingDay = (covidDateData: CovidDateData): RuleResult => {
  const issues: string[][] = [];
  let start: Date | null = null;
  let end: Date | null  = null;

  // find earliest and latest reported case
  Object.values(covidDateData.counties).forEach(countyData => {
    countyData.forEach(c => {
      if (!start || c.Reported.getTime() < start.getTime()) {
        start = c.Reported;
      }
      if (!end || c.Reported.getTime() > end.getTime()) {
        end = c.Reported;
      }
    })
  });

  // find missing data points in exisitng timeseries
  Object.values(covidDateData.counties).forEach(countyData => {
    for (let d = new Date((start as Date).getTime()); d <= (end as Date); d.setDate(d.getDate() + 1)) {
      const dateExists = countyData.find(c => isSameDay(c.Reported, d));
      if (!dateExists) {
        issues.push([
          shortDate(d),
          `${countyData[0].ID}: ${getCountyName(countyData[0].ID)}, ${getStateAbr(countyData[0].ID)}`,
          `${getPopulation(countyData[0].ID)}`
        ])
      }
    }
  });

  issues.sort((a,b) => {
    const date = b[0] > a[0] ? 1 : b[0] === a[0] ? 0 : -1;
    return date === 0 ? parseInt(b[2]) - parseInt(a[2]) : date;
  })

  return {
    rule: "Counties with Missing Data Points",
    headers: ["Missing Report", "Name", "Population"],
    issues: issues.splice(0, 25)
  };
};

const countyFIPSMissing = (covidDateData: CovidDateData): RuleResult => {
  const issues: string[][] = [];
  const knownFIPS = Object.keys(names).filter(fip => fip.substring(2, 5) !== '000');
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

  return {
    rule: "Known Counties with No Reporting",
    headers: ["FIPS", "Name", "Population"],
    issues: issues.splice(0, 25)
  };
};

const InvalidFIPS = (covidDateData: CovidDateData): RuleResult => {
  const issues: string[][] = [];
  const knownFIPS = Object.keys(names).filter(fip => fip.substring(2, 5) !== '000');
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

  return {
    rule: "Unknown FIPS Value",
    headers: ["FIPS", "Name", "Population"],
    issues: issues.splice(0, 25),
  };
};

const growthOutliers = (covidDateData: CovidDateData): RuleResult => {
  const issues: string[][] = [];
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
          shortDate(tomorrow.Reported),
          "Confirmed",
          `${yesterdayRollingAverage}`,
          `${todayGrowth}`,
          `${Math.round((todayGrowth - yesterdayRollingAverage) * 10) / 10}`,
          `${today.ID}: ${getCountyName(today.ID)}, ${getStateAbr(today.ID)}`,
        ]);
      }
      yesterdayRollingAverage =
        growth.reduce((acc, el) => acc + el, 0) / growth.length;
    });
  });

  issues.sort((a, b) => {
    const date = b[0] > a[0] ? 1 : b[0] === a[0] ? 0 : -1;
    return date === 0 ? parseInt(b[4]) - parseInt(a[4]) : date;
  });

  return {
    rule: `Counties with Outlier Growth Compared to ${numberOfDays} Day Average`,
    headers: [
      "Reported",
      "Stat",
      "5-Day Average Daily Increase",
      "Today's Increase",
      "Amount Above",
      "name",
    ],
    issues: issues.splice(0, 25),
  };
};

export const getDataIssues = (covidDateData: CovidDateData): RuleResult[] => {
  const rulesets = [
    suspiciousCountiesEqual,
    abnormalCaseChange,
    casesMustIncrease,
    casesMustPositive,
    timeseriesMissingDay,
    countyFIPSMissing,
    InvalidFIPS,
    growthOutliers
  ];
  const issues = rulesets.reduce((acc, rules) => {
    return acc.concat(rules(covidDateData));
  }, [] as RuleResult[]);
  return issues;
};
