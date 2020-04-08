import { CovidDateData } from "./AppStore";
import { getStateName, getCountyName, getStateAbr } from "../utils/fips";

type RuleResult = {
  rule: string;
  issues: string[];
};

const shortDate = (date: Date) => date.getMonth() + 1 + "/" + date.getDate();

const casesMustIncrease = (covidDateData: CovidDateData): RuleResult => {
  const issues: string[] = [];
  // States
  const states = Object.entries(covidDateData.states);
  states.forEach(([fips, stateData]) => {
    stateData.sort((a, b) => (a.Reported > b.Reported ? 1 : -1));
    stateData.forEach((today, i) => {
      const tomorrow = stateData[i + 1];
      if (!tomorrow) return;
      if (tomorrow.Confirmed < today.Confirmed) {
        const stateName = getStateName(fips);
        issues.push(
          `State ${stateName} cumulative confirmed cases decreased from ${shortDate(
            today.Reported
          )} to ${shortDate(tomorrow.Reported)}.`
        );
      }
      if (tomorrow.Dead < today.Dead) {
        const stateName = getStateName(fips);
        issues.push(
          `State ${stateName} cumulative deaths decreased from ${shortDate(
            today.Reported
          )} to ${shortDate(tomorrow.Reported)}.`
        );
      }
    });
  });
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
          `County ${countyName}, ${getStateAbr(
            fips
          )} cumulative confirmed cases decreased from ${shortDate(
            today.Reported
          )} to ${shortDate(tomorrow.Reported)}.`
        );
      }
      if (tomorrow.Dead < today.Dead) {
        const countyName = getCountyName(fips);
        issues.push(
          `County ${countyName}, ${getStateAbr(
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
  // States
  const states = Object.entries(covidDateData.states);
  states.forEach(([fips, stateData]) => {
    stateData.forEach((today) => {
      if (today.Confirmed < 0) {
        const stateName = getStateName(fips);
        issues.push(
          `State ${stateName} cumulative confirmed cases is a negative number on ${shortDate(
            today.Reported
          )}.`
        );
      }
      if (today.Dead < 0) {
        const stateName = getStateName(fips);
        issues.push(
          `State ${stateName} cumulative deaths is a negative number on ${shortDate(
            today.Reported
          )}.`
        );
      }
    });
  });
  // Counties
  const counties = Object.entries(covidDateData.counties);
  counties.forEach(([fips, countyData]) => {
    countyData.forEach((today) => {
      if (today.Confirmed < 0) {
        const countyName = getCountyName(fips);
        issues.push(
          `County ${countyName}, ${getStateAbr(
            fips
          )} cumulative confirmed cases is a negative number on ${shortDate(
            today.Reported
          )}.`
        );
      }
      if (today.Dead < 0) {
        const countyName = getCountyName(fips);
        issues.push(
          `County ${countyName}, ${getStateAbr(
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

  // States
  const states = Object.entries(covidDateData.states);
  states.forEach(([fips, stateData]) => {
    stateData.sort((a, b) => (a.Reported > b.Reported ? 1 : -1));
    stateData.forEach((today, i) => {
      const tomorrow = stateData[i + 1];
      if (!tomorrow) return;
      if (
        (tomorrow.Confirmed > today.Confirmed * tooLargeIncreaseFactor ||
          tomorrow.Confirmed === today.Confirmed) &&
        today.Confirmed > abnormalIncreaseThreshold
      ) {
        const stateName = getStateName(fips);
        issues.push(
          `State ${stateName} cumulative confirmed cases went from ${
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
        const stateName = getStateName(fips);
        issues.push(
          `State ${stateName} cumulative deaths went from ${
            today.Dead
          } on ${shortDate(today.Reported)} to ${tomorrow.Dead} on ${shortDate(
            tomorrow.Reported
          )}.`
        );
      }
    });
  });
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
          `County ${countyName}, ${getStateAbr(
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
          `County ${countyName}, ${getStateAbr(
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

export const getDataIssues = (covidDateData: CovidDateData): RuleResult[] => {
  const rulesets = [abnormalCaseChange, casesMustIncrease, casesMustPositive];
  const issues = rulesets.reduce((acc, rules) => {
    const result = rules(covidDateData);
    if (result.issues.length === 0) return acc;
    return acc.concat(rules(covidDateData));
  }, [] as RuleResult[]);
  return issues;
};
