//sqlite
const dataManager = require('./dataManager.js');
let manager = new dataManager();
let db = manager.createConnection();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function start() {
    while (true) {
        manager.feed(db);
        await sleep(60 * 1000 * 30); //The third number is the amount of minutes for every check
    }
}
start()