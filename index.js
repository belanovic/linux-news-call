const express = require('express');
const socketIO = require('socket.io');
const app = express();
const http = require('http');
////// const HOST_BACKEND = require('./hostBackend.js');
const server = http.createServer(app);

app.get('/', (req, res) => {
    res.status(200).send('Hello to the whole World');
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

    socket.on('create or join', (room) => {
      const myRoom = io.sockets.adapter.rooms.get(room) || {size: 0};
      
    /*   if(io.sockets.adapter.rooms.get(room)) {
        console.log(room)
        socket.leave(room);
      }  */

      const numClientsRoom = myRoom.size;

      if(numClientsRoom == 0) {
        socket.join(room);
        socket.emit('created', room);
      } else if(numClientsRoom == 1) {
        socket.join(room);
        socket.emit('joined', room);
      } else if (numClientsRoom == 2) {
        socket.emit('full', room);
      }
    })

    socket.on('leave', (room) => {
      socket.leave(room);
      console.log(room)
    })


    socket.on('ready', (room) => {
      console.log('roosdfsdfsm');
      socket.broadcast.to(room).emit('ready')
    })
    socket.on('candidate', (event) => {
      socket.broadcast.to(event.room).emit('candidate', event)
      console.log('evo ga kandidat')
    })
    socket.on('offer', (event) => {
      console.log('evo me offer emit');
      console.log(event.room);
      socket.broadcast.to(event.room).emit('offer', event.sdp)
    })
    socket.on('answer', (event) => {
      socket.broadcast.to(event.room).emit('answer', event.sdp)
      console.log('evo ga answer')
    })
})

const port = process.env.PORT || 4002;
const HOST_BACKEND = process.env.HOST_BACKEND || 'localhost';
server.listen(port, HOST_BACKEND, () => console.log(`Listening on port ${port}`));

