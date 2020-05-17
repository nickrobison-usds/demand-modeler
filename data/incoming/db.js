

const { Client } = require('pg');
const uuidv4 = require('uuid').v4;
const moment = require('moment');

const connectionString = process.env.DB_STRING || "postgres://kelvinluu-usds@localhost:5431/c19";
const client = new Client({ connectionString });

const impossibleCoord = 1000;
const issues = [];
const clientConnected = client.connect();
const today = moment().format("YYYY-MM-DD");
/**
 * 
 * @param {*} fips 
 * @param {*} dataDate 
 * @param {*} source 
 * @param {*} count 
 * @param {*} updatedAt 
 * @param {*} lat 
 * @param {*} long 
 */
async function addCases(fips, dataDate, source, count, updatedAt, lat, long) {
    let uuid = uuidv4();
    let priority = 10;
    switch (source) {
        case "usafacts":
            priority = 3; break;
        case "usafacts override":
            priority = 1; break;
        default: return "ignoring anything that's not USAF";
    }
    try {
        return await client.query({
            name: "add-cases"
            , text: `
            INSERT INTO county_data (
                id
                , geo_id
                , data_date
                , updated_at
                , source
                , data_count
                , latitude
                , longitude
                , data_type
                , source_priority
            ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
            , values: [uuid, fips, dataDate, updatedAt, source, +count, lat || impossibleCoord, long || impossibleCoord, "case_data", priority]
        });
    } catch (err) {
        if (err.message.includes("unique_county_data_point")) {
            return issues.push(`Duplicate ${fips} - ${dataDate} - ${source}`)
        }
        throw err;
    }
}

/**
 * 
 * @param {*} fips 
 * @param {*} dataDate 
 * @param {*} source 
 * @param {*} count 
 * @param {*} updatedAt 
 * @param {*} lat 
 * @param {*} long 
 */
async function addDeaths(fips, dataDate, source, count, updatedAt, lat, long) {
    let uuid = uuidv4();
    let priority = 10;
    switch (source) {
        case "usafacts":
            priority = 3; break;
        case "usafacts override":
            priority = 1; break;
        default: return "ignoring anything that's not USAF";
    }
    try {
        return await client.query({
            name: "add-deaths"
            , text: `
            INSERT INTO county_data (
                id
                , geo_id
                , data_date
                , updated_at
                , source
                , data_count
                , latitude
                , longitude
                , data_type
                , source_priority
            ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
            , values: [uuid, fips, dataDate, updatedAt, source, +count, lat || impossibleCoord, long || impossibleCoord, "death_data", priority]
        });
    } catch (err) {
        if (err.message.includes("unique_county_data_point")) {
            return issues.push(`Duplicate ${fips} - ${dataDate} - ${source}`)
        }
        throw err;
    }
}
/**
 * 
 * @param {*} fips 
 * @param {*} countyName 
 * @param {*} stateName 
 * @param {*} stateFp 
 * @param {*} countyFp 
 * @param {*} population 
 * @param {*} lat 
 * @param {*} long 
 */
async function createCounty(fips, countyName, stateName, stateFp, countyFp, population, lat, long) {
    let uuid = uuidv4();
    return await client.query({
        name: "add-county"
        , text: `
        INSERT INTO county (
            id
            , geo_id
            , county_name
            , state_name
            , state_fp
            , county_fp
            , population_size
            , latitude
            , longitude
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (geo_id) DO NOTHING;
        `
        , values: [uuid, fips, countyName, stateName, stateFp, countyFp, population || null, lat || impossibleCoord, long || impossibleCoord]
    })
}
async function updatePopulation(fips, population) {
    await client.query({
        name: "update-population",
        text: `
        UPDATE county
        SET population_size = $2
        WHERE geo_id = $1;`
        , values: [fips, population]
    });
}
async function updateLatLong(fips, lat, long) {
    await client.query({
        name: "update-lat-long"
        , text: `
        UPDATE county
        SET latitude = $2
        , longitude = $3
        WHERE geo_id = $1;`
        , values: [fips, lat, long]
    });
}
async function getEmptyAreas() {
    return (await client.query(`
    SELECT * FROM county WHERE population_size = 0`)).rows
}
async function badCoordinates() {
    return (await client.query(`
    SELECT * FROM county WHERE latitude = '1000' OR longitude = '1000'`)).rows;
}
async function closeConnection() {
    console.log(issues);
    return await client.end();
}

async function getDemandModelerData(date) {
    console.log(date);
    return (await client.query({
        name: 'get-demand-data',
        text: `
        SELECT
        county_name
        ,state_name
        , county_case_data.current_cases
        , new_cases
        , current_dead
        , fatality_rate
        , county.latitude lat
        , county.longitude long
        , county_case_data.data_date
        , state_fp
        , county_fp
        , population_size
        , infection_rate
        FROM county_case_data
        LEFT JOIN county ON 
            county.geo_id = county_case_data.geo_id
        LEFT JOIN county_death_data ON
            county_death_data.geo_id = county_case_data.geo_id
            AND county_death_data.data_date = county_case_data.data_date
        WHERE
            county_case_data.data_date = $1
            AND county.latitude != '1000'
            AND county.longitude != '1000'
            AND population_size > 0
        ORDER BY 
            state_fp ASC,
            county_case_data.current_cases DESC,
            county_fp ASC
        `, values: [date]
    })).rows;
}
// County Name,State Name,Confirmed,New,Death,Fatality Rate,Latitude,Longitude,Last Update,STATEFP,COUNTYFP,Population Estimate 2018 (Ths.),Infection Rate
async function getMostRecentDate() {
    const result = await client.query("SELECT data_date from county_data ORDER BY data_date DESC limit 1");
    return result.rows[0]['data_date']
}
module.exports = {
    addCases
    , addDeaths
    , createCounty
    , updatePopulation
    , clientConnected
    , closeConnection
    , updateLatLong
    , getEmptyAreas
    , badCoordinates
    , getDemandModelerData
    , getMostRecentDate
}