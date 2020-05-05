const path = require('path');
const moment = require('moment');
const writer = require("csv-writer").createObjectCsvWriter;

const { clientConnected, closeConnection, getDemandModelerData, getMostRecentDate } = require('./db');

clientConnected.then(async () => {
    let date = moment(await getMostRecentDate()).format("YYYY-MM-DD");
    for (var i = 0; i < 14; i++) {
        // if (moment(date).isAfter("2020-04-23")){
        await writeDataForDate("usafacts", date);
        // } else {
        //     await writeDataForDate('csbs', date);
        // }
        date = moment(date).subtract(1, "days").format("YYYY-MM-DD");
    }

    closeConnection();
}).catch(err => {
    console.log(err);
});

async function writeDataForDate(source, date) {
    const results = (await getDemandModelerData(source, date)).map(r => {
        let county_name = r['county_name'];
        if (county_name === 'New York County') {
            county_name = 'New York';
        }
        let fatality_rate = (+r['fatality_rate']).toFixed(1) + "%";
        return {
            ...r,
            fatality_rate
            , data_date: `${moment(r['data_date']).format("YYYY-MM-DD")} 12:00 EDT`
            , county_name
        }
    });
    const file = path.join(__dirname, '..', `covid19_county_${date}.csv`);
    const writeCleaned = writer({
        path: file,
        header: [
            { id: "county_name", title: "County Name" },
            { id: "state_name", title: "State Name" },
            { id: "current_cases", title: "Confirmed" },
            { id: "new_cases", title: "New" },
            { id: "current_dead", title: "Death" },
            { id: "fatality_rate", title: "Fatality Rate" },
            { id: "lat", title: "Latitude" },
            { id: "long", title: "Longitude" },
            { id: "data_date", title: "Last Update" },
            { id: "state_fp", title: "STATEFP" },
            { id: "county_fp", title: "COUNTYFP" },
            {
                id: "population_size",
                title: "Population Estimate 2018 (Ths.)",
            },
            { id: "infection_rate", title: "Infection Rate" },
        ],
    });
    await writeCleaned.writeRecords(results);
}