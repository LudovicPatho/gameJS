let Client = {};

Client.socket = io.connect();

Client.newPlayer = (x,y) => {
    let data = {};
    data.x = x;
    data.y = y;
    Client.socket.emit('newPlayer', data);
};

Client.move = (x,y) => {
    let data = {
        x : x,
        y : y
    }
    Client.socket.emit('move', data);
};

Client.flagCaptured = () => {
    Client.socket.emit('flagCaptured');
};

Client.removeAllPlayer = () => {
    Client.socket.emit('removeAllPlayer');
};

Client.socket.on('flagCaptured', () => {
    Game.flagCaptured();
});

Client.socket.on('createPlayer', (data) => {
    Game.createPlayer(data);
});

Client.socket.on('newEnemy', (data) => {
   // console.log(data );
   Game.createEnemy(data);
});

Client.socket.on('enemyMove', (data) => {
    //console.log(data);
    Game.enemyMove(data);
});

Client.socket.on('createAllPlayers', (data) => {
    // console.log("createallplayer");
    for (i in data) {
        Game.createEnemy(data[i]);
    }
});

Client.socket.on('remove',(id) =>{
    Game.removePlayer(id);
});

Client.socket.on('end', (message) => {
    Game.end(message);
});

Client.socket.on('konami', (message) => {
    Game.dead();
    Game.serverMessage(message);
});

Client.socket.on('message', (message) => {
    let p = document.createElement("p");
    p.innerHTML = message;
    console.log(message);
    document.querySelector('#message').appendChild(p);
});

