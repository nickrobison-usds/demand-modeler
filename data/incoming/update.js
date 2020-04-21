const fs = require("fs");
const path = require('path');
const parse = require("csv-parse/lib/sync");
const writer = require('csv-writer').createObjectCsvWriter

const filename = "covid19_county_2020-04-20.csv";
const county = fs.readFileSync(path.join(__dirname, filename));

const csvWriter = writer({
  path: path.join(__dirname,'..', filename),
  header: [
    { id: "County Name", title: "County Name" },
    { id: "State Name", title: "State Name" },
    { id: "Confirmed", title: "Confirmed" },
    { id: "New", title: "New" },
    { id: "Death", title: "Death" },
    { id: "Fatality Rate", title: "Fatality Rate" },
    { id: "Latitude", title: "Latitude" },
    { id: "Longitude", title: "Longitude" },
    { id: "Last Update", title: "Last Update" },
    { id: "STATEFP", title: "STATEFP" },
    { id: "COUNTYFP", title: "COUNTYFP" },
    {
      id: "Population Estimate 2018 (Ths.)",
      title: "Population Estimate 2018 (Ths.)",
    },
    { id: "Infection Rate", title: "Infection Rate" },
  ],
});
const dupes = {}

const results = parse(county.toString(), {
  columns: true,
  skip_empty_lines: true,
}).filter(c => {
  const key = `${c['STATEFP']}${c['COUNTYFP']}`;
  if (key in dupes) { return false };
  dupes[key] = true;
  return true;
}).map((c) => {
  const updated = { ...c };
  if (c["County Name"] == "Walton" && c["State Name"] == "Florida") {
    updated['County Name'] = 'Walton County';
  }
  return updated;
})

csvWriter
  .writeRecords(results)
  .then(() => console.log("done"))
  .catch(console.error);