const path = require('path');
const moment = require('moment');
const { clientConnected, closeConnection, getDemandModelerData } = require('./db');
clientConnected.then(async () => {
    const results = (await getDemandModelerData('csbs', '2020-04-08')).map(r=>{

        return {...r, 
            fatality_rate: `${r['fatality_rate'].slice(0,2)}%`
            ,data_date: `${moment(r['data_date']).format("YYY-MM-DD")} 12:00 EDT`}
    });
    const writer = require("csv-writer").createObjectCsvWriter;

    const writeCleaned = writer({
        path: path.join(__dirname, "TESTING.csv"),
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
    await writeCleaned.writeRecords(results)
    closeConnection();
}).catch(err => {
    console.log(err);
});
