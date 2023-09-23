const express = require('express');
const server = require('http').createServer();
const app = express();

app.get('/', function(req, res) {
    res.sendFile('index.html', { root: __dirname });
})

server.on('request', app);
server.listen(3000, function() {
    console.log('Server started on port 3000');
})

/**
 * Shuttind down the server gracefully
 */
process.on("SIGINT", () => {
    wss.clients.forEach(client => {
        client.close();
    })
    server.close(() => {
        shutdownDB();
    })
})

//** websocker */
const WebSocket = require('ws').Server;

const wss = new WebSocket({server: server});

wss.on('connection', function(ws) {
    const numClients = wss.clients.size;
    console.log('Clients connected', numClients);

    wss.broadcast(`Current visitors: ${numClients}`);

    if (ws.readyState === ws.OPEN) {
        ws.send('Welcome to my server!');
    }

    db.run(`INSERT INTO visitors (count, time)
            VALUES (${numClients}, datetime('now'))
    `);

    ws.on('close', function() {
        wss.broadcast(`Current visitors: ${numClients}`);
        console.log('A client has disconnected!');
    })
})

wss.broadcast = (message) => {
    wss.clients.forEach(function(client) {
        client.send(message);
    });
}

/** BEGIN database3 */
const sqlite = require('sqlite3');
const db = new sqlite.Database(':memory:');

db.serialize(() => {
    db.run(`
        CREATE TABLE visitors (
            count INTEGER,
            time TEXT
        )
    `)
});

function getCounts() {
    db.each("SELECT * FROM visitors", (err, row) => {
        console.log(row);
    })
}

function shutdownDB() {
    getCounts();
    console.log("Shutting down db");
    db.close()  
}