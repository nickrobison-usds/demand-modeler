import { CovidDateData, County } from "./AppStore";
import { getStateName, getCountyName, getStateAbr } from "../utils/fips";

type RuleResult = {
  rule: string;
  issues: string[];
};

const shortDate = (date: Date) => date.getMonth() + 1 + "/" + date.getDate();

const casesMustIncrease = (covidDateData: CovidDateData): RuleResult => {
  const issues: string[] = [];
  // Counties
  const counties = Object.entries(covidDateData.counties);
  counties.forEach(([fips, countyData]) => {
    countyData.sort((a, b) => (a.Reported > b.Reported ? 1 : -1));
    countyData.forEach((today, i) => {
      const tomorrow = countyData[i + 1];
      if (!tomorrow) return;
      if (tomorrow.Confirmed < today.Confirmed) {
        const countyName = getCountyName(fips);
        issues.push(
          `County ${countyName} (${fips}), ${getStateAbr(
            fips
          )} cumulative confirmed cases decreased from ${shortDate(
            today.Reported
          )} to ${shortDate(tomorrow.Reported)}.`
        );
      }
      if (tomorrow.Dead < today.Dead) {
        const countyName = getCountyName(fips);
        issues.push(
          `County ${countyName} (${fips}), ${getStateAbr(
            fips
          )} cumulative deaths decreased from ${shortDate(
            today.Reported
          )} to ${shortDate(tomorrow.Reported)}.`
        );
      }
    });
  });
  return {
    rule: "States and counties with non-increasing data",
    issues,
  };
};

const casesMustPositive = (covidDateData: CovidDateData): RuleResult => {
  const issues: string[] = [];
  // Counties
  const counties = Object.entries(covidDateData.counties);
  counties.forEach(([fips, countyData]) => {
    countyData.forEach((today) => {
      if (today.Confirmed < 0) {
        const countyName = getCountyName(fips);
        issues.push(
          `County ${countyName} (${fips}), ${getStateAbr(
            fips
          )} cumulative confirmed cases is a negative number on ${shortDate(
            today.Reported
          )}.`
        );
      }
      if (today.Dead < 0) {
        const countyName = getCountyName(fips);
        issues.push(
          `County ${countyName} (${fips}), ${getStateAbr(
            fips
          )} cumulative deaths is a negative number on ${shortDate(
            today.Reported
          )}.`
        );
      }
    });
  });
  return {
    rule: "States and counties with negative data",
    issues,
  };
};

const abnormalCaseChange = (covidDateData: CovidDateData): RuleResult => {
  const issues: string[] = [];
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
        issues.push(
          `County ${countyName} (${fips}), ${getStateAbr(
            fips
          )} cumulative confirmed cases went from ${
            today.Confirmed
          } on ${shortDate(today.Reported)} to ${
            tomorrow.Confirmed
          } on ${shortDate(tomorrow.Reported)}.`
        );
      }
      if (
        (tomorrow.Dead > today.Dead * tooLargeIncreaseFactor ||
          tomorrow.Dead === today.Dead) &&
        today.Dead > abnormalIncreaseThreshold
      ) {
        const countyName = getCountyName(fips);
        issues.push(
          `County ${countyName} (${fips}), ${getStateAbr(
            fips
          )} cumulative deaths went from ${today.Dead} on ${shortDate(
            today.Reported
          )} to ${tomorrow.Dead} on ${shortDate(tomorrow.Reported)}.`
        );
      }
    });
  });
  return {
    rule: "States and counties with abnormal day-to-day changes",
    issues,
  };
};

const suspiciousCountiesEqual = (covidDateData: CovidDateData): RuleResult => {
  const minCases = 100;
  const minDeaths = 10;
  const issues: string[] = [];
  const equalConfirmations: {[key: string]: County[]}= {}
  const equalDeaths: {[key: string]: County[]}= {}

  Object.values(covidDateData.counties).forEach(countyData => {
    countyData.forEach((county) => {
      if (county.Confirmed >= minCases) {
        const confirmedkey = `${county.Confirmed}-${county.Reported.getTime()}-${getStateAbr(county.ID)}`
        if (equalConfirmations[confirmedkey]) {
          equalConfirmations[confirmedkey].push(county)
        } else {
          equalConfirmations[confirmedkey] = [county]
        }
      }

      if (county.Dead >= minDeaths) {
        const deathkey = `${county.Dead}-${county.Reported.getTime()}-${getStateAbr(county.ID)}`
        if (equalDeaths[deathkey]) {
          equalDeaths[deathkey].push(county)
        } else {
          equalDeaths[deathkey] = [county]
        }
      }
    });
  });

  Object.values(equalConfirmations).sort((a,b)=> {
    const date = b[0].Reported.getTime() - a[0].Reported.getTime();
    return date === 0 ? b[0].Confirmed - a[0].Confirmed: date;
  }).forEach((equalCounties) => {
    if(equalCounties.length < 2) {
      return;
    }
    issues.push(`Counties have ${equalCounties[0].Confirmed} cases on ${shortDate(equalCounties[0].Reported)} ` + equalCounties.map(c => `${getCountyName(c.ID)}, ${getStateAbr(c.ID)}`).join(', '))
  });

  // Object.values(equalDeaths).forEach((equalCounties) => {
  //   if(equalCounties.length < 2) {
  //     return;
  //   }
  //   issues.push(`Counties have ${equalCounties[0].Dead} deaths on ${shortDate(equalCounties[0].Reported)} ` + equalCounties.map(c => `${getCountyName(c.ID)}, ${getStateAbr(c.ID)}`).join(', '))
  // });


  return {
    rule: "Counties with the same value on the same day",
    issues,
  };
}

export const getDataIssues = (covidDateData: CovidDateData): RuleResult[] => {
  const rulesets = [suspiciousCountiesEqual, abnormalCaseChange, casesMustIncrease, casesMustPositive];
  const issues = rulesets.reduce((acc, rules) => {
    const result = rules(covidDateData);
    if (result.issues.length === 0) return acc;
    return acc.concat(rules(covidDateData));
  }, [] as RuleResult[]);
  return issues;
};
