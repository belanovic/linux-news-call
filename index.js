const express = require('express');
const socketIO = require('socket.io');
const app = express();
const http = require('http');
///////// const HOST_BACKEND = require('./hostBackend.js');
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

let usersServer = [];
let busyCallers = []

io.on('connection', async (socket) => {
  console.log('connected' + ' ' + socket.id);
  socket.on("disconnect", (reason) => {
    console.log('disconnected' + ' ' + socket.id);
    socket.emit('bla')
  });

    socket.on('create', (room) => {

      const newRoom = io.sockets.adapter.rooms.get(room) || {size: 0};

      if(newRoom.size === 0) {
        socket.join(room);
        console.log('createeeee' + ' ' + room)
      }

      const usersServerHasRoom = usersServer.some((prom) => prom === room);
      console.log('usersServerHasRoom' + ' ' + usersServerHasRoom)
      if(!usersServerHasRoom) {
          console.log('usersServerHasRoom' + ' ' + usersServerHasRoom)
          usersServer.push(room);
          io.emit('reloadUsers', usersServer); 
      }
      io.emit('reloadUsers', usersServer);
    })

    socket.on('join', (room) => {
      const myRoom = io.sockets.adapter.rooms.get(room) || {size: 0};
      
      const numClientsRoom = myRoom.size;

      console.log('join' + ' ' + room + ' ' + numClientsRoom)

      if(numClientsRoom == 1) {
        socket.join(room);
        socket.emit('joined', room);
        console.log('joined' + ' ' + room)
      } else if (numClientsRoom == 2) {
        socket.emit('full', room);
        console.log('full' + ' ' + room)
      }
    })

    socket.on('calling', (room) => {
      socket.broadcast.to(room).emit('calling', room)
      console.log('calling' + ' ' + room)
    })

    socket.on('accept', (room) => {
      socket.emit('accept', room)
    })
    socket.on('reject', (room) => {
      socket.broadcast.to(room).emit('reject', room)
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
    socket.on('end', (room) => {
      io.in(room).emit('end');
      console.log('evo ga end');
    })
    
    socket.on('leaveRoom', (room) => {
      socket.leave(room);
      console.log(room);
    })
    socket.on('leaveCall', (user) => {
      console.log(user);
      const indexRoom = usersServer.indexOf(user);
      console.log(indexRoom);
      const d = usersServer.splice(indexRoom, 1);
      console.log(d);
      io.emit('leftCall', usersServer)
    })
})

const port = process.env.PORT || 4002;
const HOST_BACKEND = process.env.HOST_BACKEND || 'localhost';
server.listen(port, HOST_BACKEND, () => console.log(`Listening on port ${port}`));

