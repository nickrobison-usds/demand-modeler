const fs = require('fs');
const path = require('path');
const stream = require('stream');

const parse = require("csv-parse");
const moment = require('moment');

const { addCases
    , addDeaths
    , createCounty
    , updatePopulation
    , clientConnected
    , closeConnection} = require('./db');
const pFile = path.join(__dirname, 'cases_by_county_with_overrides.csv');;

const counties = {};
const pAdapterStream = new stream.Writable({
    objectMode: true,
    async write(record, _encoding, callback) {
        await clientConnected;
        const date = moment(record['date']).format('YYYY-MM-DD');
        const fips = record["fips_code"];
        const sourceKey = Object.keys(record)[0]; // had issues using the key 'source' due to invisible characters. 
        const source = record[sourceKey].toLowerCase();

        if (!(fips in counties)) {
            await createCounty(
                fips
                , record["County_county"]
                , record["state_name"]
                , record["state_fips"]
                , fips.slice(2)
                , +record['Total_Total_Pop'] / 1000
            );
            counties[fips] = false; // pop could be set by anyone....
        } else if (counties[fips] === false && source === 'csbs'){
            await updatePopulation(fips, +record['Total_Total_Pop'] / 1000);
            counties[fips] = true;
        }
        switch (record['type'].toLowerCase()) {
            case "cases": await addCases(fips, date, source, record['value'], date); break;
            case "deaths": await addDeaths(fips, date, source, record['value'], date); break;
            default: throw new Error(`Invalid record type! ${record['type']}`);
        }
        callback();
    }
});
pAdapterStream.on("finish", async () => {
    console.log("Done!!")
    await closeConnection();
})


const parser = parse({
    delimiter: ",", columns: true
});
parser.on("error", function (err) {
    console.error(err.message);
});

fs.createReadStream(pFile, { encoding: 'utf8' })
    .pipe(parser)
    .pipe(pAdapterStream);
