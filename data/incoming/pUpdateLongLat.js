const fs = require('fs');
const path = require('path');
const parse = require('csv-parse/lib/sync')
const { updatePopulation
    , clientConnected
    , closeConnection
    , updateLatLong
    , getEmptyAreas
    , badCoordinates } = require('./db')
const countyFile = path.join(__dirname, 'scratch_data', 'lat_long_pop.csv');
const countyData = fs.readFileSync(countyFile)

Promise.all(parse(countyData, {
    columns: true,
    skip_empty_lines: true
}).map(async (data) => {
    await clientConnected;
    const fips = `${data['STATEFP']}${data['COUNTYFP']}`;
    await updatePopulation(fips, data['Population Estimate 2018 (Ths.)']);
    await updateLatLong(fips, data['Latitude'], data['Longitude']);
})).finally(async () => {
    console.log(await getEmptyAreas());
    console.log(await badCoordinates());
    console.log("counties updated");
    closeConnection();
});
