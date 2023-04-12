const sqlite3 = require("sqlite3").verbose();
const fs = require('node:fs')
const filepath = "./sqlite.db";
const { WebhookClient } = require('discord.js');
let Parser = require('rss-parser');
let parser = new Parser();

class dataManager {
  createTable(db) {
    db.exec(`CREATE TABLE feed
        (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        rssurl   VARCHAR(2048) NOT NULL,
        webhook   VARCHAR(2048) NOT NULL,
        lastPub   VARCHAR(2048)
        );
   `);
  }

  createConnection() {
    if (fs.existsSync(filepath)) {
      return new sqlite3.Database(filepath);
    } else {
      const db = new sqlite3.Database(filepath, (error) => {
        if (error) {
          return console.error(error.message);
        }
      });
      this.createTable(db);
      console.log("Connection with SQLite has been established");
      return db;
    }
  }

  setupFeed(db, rssurl, webhook) {
    db.run(
      `INSERT INTO feed (rssurl, webhook) VALUES (?, ?)`,
      [rssurl, webhook],
      function (error) {
        if (error) {
          console.error(error.message);
        }
        console.log(`Inserted a row with the ID: ${this.lastID}`);
      }
    );
  }

  update(db, id, lastPub) {
    db.run(
      `UPDATE feed set lastPub = ? WHERE id = ?`,
      [lastPub, id],
      function (error) {
        if (error) {
          console.error(error.message);
        }
      }
    );
  }

  feed(db) {
    try {
      db.each(`SELECT * FROM feed`, async (error, row) => {
        if (error) {
          throw new Error(error.message);
        }
        function send(link) {
          //console.log(link)
          console.log(`send: ${link}`)
          const webhookClient = new WebhookClient({ url: row.webhook });
  
          webhookClient.send({
            content: `${link}`,
            //username: 'RSS Feed',//MacRumors Feed
            // embeds: [embed],
          });
        }
        let feed = await parser.parseURL(row.rssurl);
        if (row.lastPub == null) {
          this.update(db, row.ID, feed.items[0].title)
        } else {
  
        await feed.items.every(item => {
          if (item.title == row.lastPub) return false;
          send(item.link)
          return true;
        });
        this.update(db, row.ID, feed.items[0].title)
        }
      });
    } catch {
      console.log("Failed to fetch feed, trying again next cycle.")
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = dataManager;