const fs = require('fs');
const { clientConnected, closeConnection, getEmptyAreas, badCoordinates } = require('./db');

clientConnected.then(async()=>{
    let emptyAreas = await getEmptyAreas();
    let badCoordinateData = await badCoordinates()
    fs.writeFileSync('./log', JSON.stringify({
        emptyAreas, badCoordinateData
    }))
    await closeConnection();
    process.exit();
}).catch(err=> {console.log(err); process.exit(1)} )