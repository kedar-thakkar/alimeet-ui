

const express = require('express');
const socketio = require('socket.io');
const http = require('http');

var socket_cors = "http://localhost:3000";

const app = express();
app.use(express.static(__dirname + '/public'));

const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: `${socket_cors}`,
    methods: ["GET", "POST"]
  }
});

app.get('/', (req, res) => {
  res.status(200).send('Working...');
})

// implementing socket  

io.on('connection', (socket) => {

  console.log("We have a new connection!!!");

  socket.on('join', ({ room }) => {
    console.log("Room name: ", room);
    socket.join(room);

    socket.on("screen-share", ({isScreenShareOn, newRoom}) => {
      console.log('screen-share emitted ! ',isScreenShareOn, newRoom);
      socket.broadcast.to(room).emit('screen-share-on', { isScreenShareOn, newRoom });
    })

    socket.on("subtitle", ({ sttSentence, userName, isSubtitle, remoteUserId, subtitle, subtitleFlag, subtitleSegment, remoteUserProfile }) => {
      socket.to(room).emit('subtitle-data', { sttSentence, userName, isSubtitle, remoteUserId, subtitle, subtitleFlag, subtitleSegment, remoteUserProfile });
    });

    socket.on('mute-everyone', () => {
      socket.broadcast.to(room).emit('on-mute-everyone');
    })

    socket.on('document-counter', ({count}) => {
      console.log(count);
      socket.broadcast.to(room).emit('on-document-counter' ,count);      
    })

    socket.on('unmute-everyone', () => {
      socket.broadcast.to(room).emit('on-unmute-everyone');
    })

    socket.on('send-message', ({ message, messagetime, name }) => {
      socket.broadcast.to(room).emit('new-message', { message, messagetime, name });
    })

    socket.on('share-screen-message', ({ message, user, name }) => {
      socket.broadcast.to(room).emit('share-screen', { message });
    })

    socket.on('share-screen-off', ({ id }) => {
      socket.broadcast.to(room).emit('remove-share-screen', { id });
    })


    socket.on('show-student', ({ id, action }) => {
      socket.broadcast.to(room).emit('on-show-student', { id, action });
    })

    socket.on('handle-whiteboard', ({ action }) => {
      socket.broadcast.to(room).emit('on-handle-whiteboard', { action });
    })

  })

  // Meeting socket code 
  socket.on('joinmeeting', ({ room }) => {
    socket.join(room);
  })

  socket.on('disconnect', () => {
    console.log("User Left");
  })

  // White board socket code start
  socket.on('join-whiteboard', ({ roomname }) => {
    console.log('roomname: ', roomname);
    socket.join(roomname);
    const room = roomname;
    socket.on('drawing', function (data) {
      socket.broadcast.to(room).emit('drawing', data);
      console.log(data);
    });
  
    socket.on('rectangle', function (data) {
      socket.broadcast.to(room).emit('rectangle', data);
      console.log(data);
    });
  
    socket.on('linedraw', function (data) {
      socket.broadcast.to(room).emit('linedraw', data);
      console.log(data);
    });
  
    socket.on('circledraw', function (data) {
      socket.broadcast.to(room).emit('circledraw', data);
      console.log(data);
    });
  
    socket.on('ellipsedraw', function (data) {
      socket.broadcast.to(room).emit('ellipsedraw', data);
      console.log(data);
    });
  
    socket.on('textdraw', function (data) {
      socket.broadcast.to(room).emit('textdraw', data);
      console.log(data);
    });
  
    socket.on('copyCanvas', function (data) {
      socket.broadcast.to(room).emit('copyCanvas', data);
      console.log(data);
    });
  
    socket.on('Clearboard', function (data) {
      socket.broadcast.to(room).emit('Clearboard', data);
      console.log(data);
    });

    
  }) 

  // White board socket code end
});

app.use(express.json())

// Port 
const port = process.env.port || 5000

// Starting server .
server.listen(port, () => console.log(`listening on post ${port}`));