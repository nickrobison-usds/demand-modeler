
const { clientConnected, closeConnection, getEmptyAreas, badCoordinates } = require('./db');

clientConnected.then(async()=>{
    let emptyAreas = await getEmptyAreas();
    let badCoordinateData = await badCoordinates()
    console.log(emptyAreas);
    console.log(badCoordinateData);
})