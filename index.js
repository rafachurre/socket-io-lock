var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

const connectedSockets = [];

// Sets a 3s timer, mocking a server call to save a file
const mockSaveFile = async () => {
	return new Promise(resolve => setTimeout(resolve, 3000))
}

const lockAllClients = () => {
    connectedSockets.map((socket) => socket.emit('lock'));
}

const unLockAllClients = () => {
    connectedSockets.map((socket) => socket.emit('unlock'));
}

const broadcastNewData = (newData) => {
    connectedSockets.map((socket) => socket.emit('newData', newData));
}

//Socket event config
io.on('connection', function(socket){
  console.log('new client connected');
  connectedSockets.push(socket);

  socket.on('saveData', (data) => {
      console.log('Data reveived form client', data);
      console.log('Activating lock and sending data to S3');
      // Lock all clients
      lockAllClients();
			// Save File
			mockSaveFile().then(() => {
				// Unlock all clients
				unLockAllClients();
				// Broadcast new data
				broadcastNewData(data);
			})
  })

  socket.on('disconnect', () => console.log('Client disconnected'));
});

// Listen
http.listen(3000, function(){
  console.log('listening on *:3000');
});