const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const cors = require('cors');

app.get('/', function (req, res) {
    res.sendfile('index.html');
});

app.use(cors());

//Whenever someone connects this gets executed
var clients = 0;
var readyToPlay = 0;
io.on('connection', function (socket) {
    console.log('A user connected');
    clients++;
    if (readyToPlay < 0) {
        readyToPlay = 0;
    }
    io.sockets.emit('broadcast', { description: clients + ' clients connected!' });

    socket.on('readyToPlay', function () {
        console.log("readyToPlay event occured.")
        readyToPlay++;
        console.log("Number of clients ready to play", readyToPlay);
        if (readyToPlay >= 2) {
            io.sockets.emit('allReadyToPlay');
        }
    });

    socket.on('peerReady', function (data) {
        console.log("peerReady event occured.")
        socket.broadcast.emit("peerReady", { userAgent: data.userAgent })
    })

    socket.on('playEvent', function () {
        console.log('The play button was pressed by the client.')
        io.sockets.emit('broadcastPlay');
    });


    socket.on('pauseEvent', function () {
        console.log('The pause button was pressed by the client.')
        io.sockets.emit('broadcastPause');
    });

    socket.on('setTime', function (data) {
        console.log("The seek time was set by the client.")
        io.sockets.emit('broadcastTime', { time: data.time })
        console.log(data.time);
    })

    socket.on('disconnect', function () {
        console.log('A user disconnected');
        clients--;
        readyToPlay--;
        io.sockets.emit('broadcast', { description: clients + ' clients connected!' });
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});