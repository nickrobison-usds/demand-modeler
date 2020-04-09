import { CovidDateData, County } from "./AppStore";
import { getStateName, getCountyName, getStateAbr } from "../utils/fips";

type RuleResult = {
  rule: string;
  headers: string[];
  issues: string[][];
};

const shortDate = (date: Date) => date.getMonth() + 1 + "/" + date.getDate();

// const casesMustIncrease = (covidDateData: CovidDateData): RuleResult => {
//   const issues: string[] = [];
//   // Counties
//   const counties = Object.entries(covidDateData.counties);
//   counties.forEach(([fips, countyData]) => {
//     countyData.sort((a, b) => (a.Reported > b.Reported ? 1 : -1));
//     countyData.forEach((today, i) => {
//       const tomorrow = countyData[i + 1];
//       if (!tomorrow) return;
//       if (tomorrow.Confirmed < today.Confirmed) {
//         const countyName = getCountyName(fips);
//         issues.push(
//           `County ${countyName} (${fips}), ${getStateAbr(
//             fips
//           )} cumulative confirmed cases decreased from ${shortDate(
//             today.Reported
//           )} to ${shortDate(tomorrow.Reported)}.`
//         );
//       }
//       if (tomorrow.Dead < today.Dead) {
//         const countyName = getCountyName(fips);
//         issues.push(
//           `County ${countyName} (${fips}), ${getStateAbr(
//             fips
//           )} cumulative deaths decreased from ${shortDate(
//             today.Reported
//           )} to ${shortDate(tomorrow.Reported)}.`
//         );
//       }
//     });
//   });
//   return {
//     rule: "States and counties with non-increasing data",
//     issues,
//   };
// };

// const casesMustPositive = (covidDateData: CovidDateData): RuleResult => {
//   const issues: string[] = [];
//   // Counties
//   const counties = Object.entries(covidDateData.counties);
//   counties.forEach(([fips, countyData]) => {
//     countyData.forEach((today) => {
//       if (today.Confirmed < 0) {
//         const countyName = getCountyName(fips);
//         issues.push(
//           `County ${countyName} (${fips}), ${getStateAbr(
//             fips
//           )} cumulative confirmed cases is a negative number on ${shortDate(
//             today.Reported
//           )}.`
//         );
//       }
//       if (today.Dead < 0) {
//         const countyName = getCountyName(fips);
//         issues.push(
//           `County ${countyName} (${fips}), ${getStateAbr(
//             fips
//           )} cumulative deaths is a negative number on ${shortDate(
//             today.Reported
//           )}.`
//         );
//       }
//     });
//   });
//   return {
//     rule: "States and counties with negative data",
//     issues,
//   };
// };

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
        issues.push(
          [
            `${shortDate(today.Reported)}`,
            "Confirmed",
            `${today.Confirmed}`,
            `${tomorrow.Confirmed}`,
            `${countyName}, ${getStateAbr(fips)}`,
            `${fips}`
          ]
        );
      }
    });
  });

  issues.sort((a,b)=> {
    const date = b[0] > a[0] ? 1 : b[0] === a[0] ? 0 : -1;
    return date === 0 ? parseInt(b[3]) - parseInt(a[3]): date;
  })

  return {
    rule: "States and counties with abnormal day-to-day changes",
    headers: ["Reported", "Stat", "Existing Value", "New Value", "name", "fips"],
    issues: issues.splice(0,25),
  };
};

const suspiciousCountiesEqual = (covidDateData: CovidDateData): RuleResult => {
  const minCases = 25;
  const issues: string[][] = [];
  const equalConfirmations: {[key: string]: County[]}= {}

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
    });
  });

  Object.values(equalConfirmations).sort((a,b)=> {
    const date = b[0].Reported.getTime() - a[0].Reported.getTime();
    return date === 0 ? b[0].Confirmed - a[0].Confirmed: date;
  }).forEach((equalCounties) => {
    if(equalCounties.length < 2) {
      return;
    }
    issues.push(
      [
        shortDate(equalCounties[0].Reported),
        "Confirmed",
        `${equalCounties[0].Confirmed}`,
        equalCounties.map(c => `${c.ID}: ${getCountyName(c.ID)}, ${getStateAbr(c.ID)}`).join(', '),
      ]
    )
  });

  return {
    rule: "Counties with the same value on the same day",
    headers: ["Reported", "Stat", "Value", "name"],
    issues: issues.splice(0,25),
  };
}

export const getDataIssues = (covidDateData: CovidDateData): RuleResult[] => {
  const rulesets = [suspiciousCountiesEqual, abnormalCaseChange];//, casesMustIncrease, casesMustPositive];
  const issues = rulesets.reduce((acc, rules) => {
    const result = rules(covidDateData);
    if (result.issues.length === 0) return acc;
    return acc.concat(rules(covidDateData));
  }, [] as RuleResult[]);
  return issues;
};
