import { CovidDateData } from "./AppStore";
import { getStateName, getCountyName } from "../utils/fips";

const shortDate = (date: Date) => date.getMonth() + 1 + "/" + date.getDate();

const casesMustIncrease = (covidDateData: CovidDateData) => {
  const messages: string[] = [];
  // States
  const states = Object.entries(covidDateData.states);
  states.forEach(([fips, stateData]) => {
    stateData.sort((a, b) => (a.Reported > b.Reported ? 1 : -1));
    stateData.forEach((today, i) => {
      const tomorrow = stateData[i + 1];
      if (!tomorrow) return;
      if (tomorrow.Confirmed < today.Confirmed) {
        const stateName = getStateName(fips);
        messages.push(
          `State ${stateName} cumulative confirmed cases decreased from ${shortDate(
            today.Reported
          )} to ${shortDate(tomorrow.Reported)}.`
        );
      }
      if (tomorrow.Dead < today.Dead) {
        const stateName = getStateName(fips);
        messages.push(
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
        messages.push(
          `County ${countyName} (${fips}) cumulative confirmed cases decreased from ${shortDate(
            today.Reported
          )} to ${shortDate(tomorrow.Reported)}.`
        );
      }
      if (tomorrow.Dead < today.Dead) {
        const countyName = getCountyName(fips);
        messages.push(
          `County ${countyName} (${fips}) cumulative deaths decreased from ${shortDate(
            today.Reported
          )} to ${shortDate(tomorrow.Reported)}.`
        );
      }
    });
  });
  return messages;
};

const casesMustPositive = (covidDateData: CovidDateData) => {
  const messages: string[] = [];
  // States
  const states = Object.entries(covidDateData.states);
  states.forEach(([fips, stateData]) => {
    stateData.forEach((today) => {
      if (today.Confirmed < 0) {
        const stateName = getStateName(fips);
        messages.push(
          `State ${stateName} cumulative confirmed cases is a negative number on ${shortDate(
            today.Reported
          )}.`
        );
      }
      if (today.Dead < 0) {
        const stateName = getStateName(fips);
        messages.push(
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
        messages.push(
          `County ${countyName} (${fips}) cumulative confirmed cases is a negative number on ${shortDate(
            today.Reported
          )}.`
        );
      }
      if (today.Dead < 0) {
        const countyName = getCountyName(fips);
        messages.push(
          `County ${countyName} (${fips}) cumulative deaths is a negative number on ${shortDate(
            today.Reported
          )}.`
        );
      }
    });
  });
  return messages;
};

export const getDataIssues = (covidDateData: CovidDateData) => {
  const rulesets = [casesMustIncrease, casesMustPositive];
  const messages = rulesets.reduce((acc, rules) => {
    return acc.concat(rules(covidDateData));
  }, [] as string[]);
  return messages;
};
