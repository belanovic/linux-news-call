const express = require('express');
const socketIO = require('socket.io');
const app = express();
const http = require('http');
const HOST_BACKEND = require('./hostBackend.js');
const server = http.createServer(app);

app.get('/', (req, res) => {
    res.status(200).send('Hello World');
})

const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

io.on('connection', async (socket) => {
    console.log('connected')
})

const port = process.env.PORT || 4002;
HOST_BACKEND = process.env.HOST_BACKEND || 'localhost';
server.listen(port, HOST_BACKEND, () => console.log(`Listening on port ${port}`));

