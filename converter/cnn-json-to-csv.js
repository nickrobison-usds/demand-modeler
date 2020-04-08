const request = require('request');
const jsonexport = require('jsonexport');
const fs = require('fs');

const flattenJson = data => {
   return data.flatMap(state => {
      return state.data.map(day => {
         return {
            usps: state.usps,
            name: state.name,
            fips: state.fips,
            date: day.date,
            cases: day.cases,
            death: day.deaths
         };
      });
   });
};

const exportToCsv = (err, csv) => {
   if (err) {
      return console.log(err);
   }

   writeCsvToFile(csv);
};

const writeCsvToFile = (csv) => {
   fs.writeFile(__dirname + '/output/cnn-latest.csv', csv, (err, data) => {
      if (err) {
         return console.log(err);
      }

      console.log('Done exporting!');
   });
};

request('https://ix.cnn.io/data/novel-coronavirus-2019-ncov/us/historical.min.json', { json: true }, (err, res, body) => {
   if (err) {
      return console.log(err);
   }

   const jsonData = flattenJson(body.data);
   jsonexport(jsonData, exportToCsv);
});