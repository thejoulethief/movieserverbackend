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
io.on('connection', function (socket) {
    console.log('A user connected');
    clients++;

    io.sockets.emit('broadcast', { description: clients + ' clients connected!' });

    socket.on('playEvent', function () {
        console.log('The play button was pressed by the client.')
        io.sockets.emit('broadcastPlay');
    });

    socket.on('messageSent', function (data) {
        console.log("The following message was sent", data.text)
        socket.broadcast.emit('messageRecieved', { user: socket.id, text: data.text })
    })


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
        io.sockets.emit('broadcast', { description: clients + ' clients connected!' });
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});