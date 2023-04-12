const readline = require("readline");
const dataManager = require('./dataManager.js');
let manager = new dataManager();
let db = manager.createConnection();

const read_line_interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

read_line_interface.question("Please enter your RSS Feed URL ", function(feed) {//https://feeds.macrumors.com/MacRumors-All
    read_line_interface.question("Now enter your WebHook URL ", function(webhook) {
        
        console.log(`${webhook}, ${feed}`);
        manager.setupFeed(db, `${feed}`, `${webhook}`)
        // Close readline interface.
        read_line_interface.close();
    });
});

// read_line_interface.on("close", function() {
//     // Exit the process.
//     process.exit(0);
// });
