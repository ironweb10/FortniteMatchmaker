const WebSocket = require('ws').Server;
const Server = '[SERVER]';
const crypto = require("crypto");

// Configura los puertos
const port1 = 7777;
const port2 = 8888;

// Inicia el primer WebSocket Server
const wss1 = new WebSocket({ port: process.env.PORT1 || port1 }, () => {
    console.log(Server, "Matchmaker started listening on port", process.env.PORT1 || port1);
});

wss1.on('connection', async (ws) => {
    handleConnection(ws);
});

// Inicia el segundo WebSocket Server
const wss2 = new WebSocket({ port: process.env.PORT2 || port2 }, () => {
    console.log(Server, "Matchmaker started listening on port", process.env.PORT2 || port2);
});

wss2.on('connection', async (ws) => {
    handleConnection(ws);
});

function handleConnection(ws) {
    if (ws.protocol.toLowerCase().includes("xmpp")) {
        return ws.close();
    }

    // Crea hashes
    const ticketId = crypto.createHash('md5').update(`1${Date.now()}`).digest('hex');
    const matchId = crypto.createHash('md5').update(`2${Date.now()}`).digest('hex');
    const sessionId = crypto.createHash('md5').update(`3${Date.now()}`).digest('hex');

    // Enviar mensajes a través del WebSocket
    Connecting();
    Waiting();
    Queued();
    SessionAssignment();
    setTimeout(Join, 2000);

    function Connecting() {
        ws.send(JSON.stringify({
            "payload": {
                "state": "Connecting"
            },
            "name": "StatusUpdate"
        }));
    }

    function Waiting() {
        ws.send(JSON.stringify({
            "payload": {
                "totalPlayers": 1,
                "connectedPlayers": 1,
                "state": "Waiting"
            },
            "name": "StatusUpdate"
        }));
    }

    function Queued() {
        ws.send(JSON.stringify({
            "payload": {
                "ticketId": ticketId,
                "queuedPlayers": 0,
                "estimatedWaitSec": 0,
                "status": {},
                "state": "Queued"
            },
            "name": "StatusUpdate"
        }));
    }

    function SessionAssignment() {
        ws.send(JSON.stringify({
            "payload": {
                "matchId": matchId,
                "state": "SessionAssignment"
            },
            "name": "StatusUpdate"
        }));
    }

    function Join() {
        ws.send(JSON.stringify({
            "payload": {
                "matchId": matchId,
                "sessionId": sessionId,
                "joinDelaySec": 1
            },
            "name": "Play"
        }));
    }

    ws.on('message', function incoming(message) {
        console.log(Server, 'A client sent a message:', message);
    });
}

