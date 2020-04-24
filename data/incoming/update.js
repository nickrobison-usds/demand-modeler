const fs = require("fs");
const path = require("path");
const parse = require("csv-parse/lib/sync");
const writer = require("csv-writer").createObjectCsvWriter;

const prevDate = "2020-04-22";
const currentDate = "2020-04-23";
const prevDayCasesFile = path.join(
  __dirname,
  "..",
  `covid19_county_${prevDate}.csv`
);
const currentCasesFile = path.join(__dirname, "covid19_county_fips..csv");

const dataIssues = {
  confirmed: { total: 0, details: [] },
  death: { total: 0, details: [] },
  newConfirmed: { total: 0, details: [] },
  addedCounties: { total: 0, details: [] },
  missingStates: { total: 0, details: [] },
};
class County{
  /**
   * 
   * @param {*} county.countyName 
   * @param {*} county.stateName 
   * @param {*} county.confirmed 
   * @param {*} county.newConfirmed 
   * @param {*} county.death 
   * @param {*} county.lat 
   * @param {*} county.long 
   * @param {*} county.updated 
   * @param {*} county.stateFP 
   * @param {*} county.countyFP 
   * @param {*} county.population 
   */
  constructor(county) {
    const { countyName, stateName, confirmed, newConfirmed, death, lat, long, updated, stateFP, countyFP, population } = county;
      this.countyName = countyName;
      this.stateName = stateName;
      this.confirmed = +confirmed;
      this.newConfirmed = +newConfirmed;
      this.death = +death;
      this.lat = lat;
    this.long = long;
    this.updated = updated;
    this.stateFP = stateFP;
    this.countyFP = countyFP;
    this.population = +population;
    
  }
  updateCases(confirmed, death, updated, newConfirmed) {
    if (confirmed < this.confirmed) {
      dataIssues.confirmed.total += Math.abs(this.confirmed - confirmed);
      dataIssues.confirmed.details.push(
        `Confirmed ${this.stateName} - ${this.countyName} . Prev: ${this.confirmed}; New:${confirmed}`
      );
    };
    if (death < this.death) {
      dataIssues.death.total += Math.abs(this.death - death);
      dataIssues.death.details.push(
        `Death ${this.stateName} - ${this.countyName} . Prev: ${this.death}; New:${death}`
      );
    }
    if (+newConfirmed != ((+confirmed) - this.confirmed)) {

      dataIssues.newConfirmed.total += Math.abs(((+confirmed) - this.confirmed)- newConfirmed);
      dataIssues.newConfirmed.details.push(
        `newConfirmed ${this.stateName} - ${this.countyName} . calculated: ${this.newConfirmed}; New:${newConfirmed}`
      );
    }
    this.newConfirmed = +newConfirmed || (+confirmed) - this.confirmed;
    this.confirmed = confirmed;
    this.death = death;
    this.updated = updated;
  }
  get key() {
    return `${this.stateFP}${this.countyFP}`
  }
  get fatalityRate() {
    return `${Math.round(this.death/this.confirmed*1000)/10}%`
  }
  get infectionRate() {
    const rate = `${this.confirmed / this.population}`
    if (rate.length > 18) return rate.slice(0, 19);
    return rate;
  }
}

// Load previous day and set things up
const prevDay = {};
const prevCounties = parse(fs.readFileSync(prevDayCasesFile), {
  columns: true,
  skip_empty_lines: true,
}).map((c) => {
  const updated = { ...c };
  if (c["County Name"] == "Walton" && c["State Name"] == "Florida") {
    updated["County Name"] = "Walton County";
  }
  const county = new County({
    countyName: updated["County Name"],
    stateName: updated["State Name"],
    confirmed: updated["Confirmed"],
    newConfirmed: 0, // since we are creating this for the next day, start at zero new cases;
    death: updated["Death"],
    lat: updated["Latitude"],
    long: updated["Longitude"],
    updated: updated["Last Update"],
    stateFP: updated["STATEFP"],
    countyFP: updated["COUNTYFP"],
    population: updated["Population Estimate 2018 (Ths.)"],
  });
  prevDay[county.key] = county;
  return county;
});
const newCounties = parse(fs.readFileSync(currentCasesFile), {
  columns: true,
  skip_empty_lines: true,
})
  .map((c) => {
    const updated = { ...c };
    if (c["County Name"] == "Walton" && c["State Name"] == "Florida") {
      updated["County Name"] = "Walton County";
    }
    const county = new County({
      countyName: updated["County Name"],
      stateName: updated["State Name"],
      confirmed: updated["Confirmed"],
      newConfirmed: updated["New"],
      death: updated["Death"],
      lat: updated["Latitude"],
      long: updated["Longitude"],
      updated: updated["Last Update"],
      stateFP: updated["STATEFP"],
      countyFP: updated["COUNTYFP"],
      population: updated["Population Estimate 2018 (Ths.)"],
    });
    if (county.key in prevDay) {
      prevDay[county.key].updateCases(county.confirmed, county.death, county.updated, county.newConfirmed);
      return null;
    }
    dataIssues.addedCounties.total += 1;
    dataIssues.addedCounties.details.push(`${county.stateName} ${county.countyName} not in previous dataset`);
    prevDay[county.key] = county; // will remove any issues with duplicates.
    return county;
  }).filter(c => c);

let allCounties = prevCounties.concat(newCounties);

const stateNewCases = {};
allCounties.forEach((c) => {
  if (c.stateName in stateNewCases) {
    stateNewCases[c.stateName] += c.newConfirmed;
  } else {
    stateNewCases[c.stateName] = c.newConfirmed;
  }
});
Object.entries(stateNewCases).forEach((state) => {
  if (state[0] === "District of Columbia") return;

  if (!state[1]) {
    dataIssues.missingStates.total += 1;
    dataIssues.missingStates.details.push(`No new cases - ${state[0]}`)
  } 
});
console.log("Data issues");
console.log(`confirmed inconsistency total: ${dataIssues.confirmed.total}`);
console.log(`death inconsistency total: ${dataIssues.death.total}`);
console.log(`newConfirmed inconsistency total: ${dataIssues.newConfirmed.total}`);
console.log(`addedCounties total: ${dataIssues.addedCounties.total}`);
console.log(`missingStates total: ${dataIssues.missingStates.total}`);
fs.writeFileSync(
  path.join(__dirname, `report_${currentDate}.log`),
`# Data Issues
## Summary

* confirmed inconsistency total: ${dataIssues.confirmed.total}
* death inconsistency total: ${dataIssues.death.total}
* newConfirmed inconsistency total: ${dataIssues.newConfirmed.total}
* addedCounties total: ${dataIssues.addedCounties.total}
* missingStates total: ${dataIssues.missingStates.total}

## Details
${JSON.stringify(dataIssues)}
`
);
const writeCleaned = writer({
  path: path.join(__dirname, "..", `covid19_county_${currentDate}.csv`),
  header: [
    { id: "countyName", title: "County Name" },
    { id: "stateName", title: "State Name" },
    { id: "confirmed", title: "Confirmed" },
    { id: "newConfirmed", title: "New" },
    { id: "death", title: "Death" },
    { id: "fatalityRate", title: "Fatality Rate" },
    { id: "lat", title: "Latitude" },
    { id: "long", title: "Longitude" },
    { id: "updated", title: "Last Update" },
    { id: "stateFP", title: "STATEFP" },
    { id: "countyFP", title: "COUNTYFP" },
    {
      id: "population",
      title: "Population Estimate 2018 (Ths.)",
    },
    { id: "infectionRate", title: "Infection Rate" },
  ],
});
writeCleaned
  .writeRecords(allCounties)
  .then(() => console.log("done"))
  .catch(console.error);
