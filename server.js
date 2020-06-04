const express = require('express');
const app = express();
const serv = require('http').Server(app);
const port = 2406;

let player_list = {};
let player = {};

app.get('/',(req, res) => {
    res.sendFile(__dirname + '/client/index.html');
});

app.use('/client',express.static(__dirname + '/client'));
app.use((req, res, next) => res.status(404).sendFile(__dirname + '/client/404.html'));


serv.listen(process.env.PORT || port);
console.log(`*** Démarage du serveur sur le port ${port} ***`);

// io connection
let io = require('socket.io')(serv,{});

io.sockets.on('connection', (socket)=>{

    socket.on('newPlayer', (data) => {

        socket.emit('createPlayer', socket.id);
        socket.emit('message', `Vous êtes connecté sous le pseudo : <strong>${socket.pseudo}</strong> avec l'id ${socket.id}`);
        socket.emit('createAllPlayers',player_list);
        player_list[socket.id] = {
            id : socket.id,
            x : data.x,
            y : data.y,
            pseudo : socket.pseudo
        }
    });

    socket.on('move', (data) => {
        player_list[socket.id] =  {
            id : socket.id,
            x : data.x,
            y : data.y,
            pseudo : socket.pseudo
        }
        socket.broadcast.emit('enemyMove', player_list[socket.id] );
    });

    socket.on('flagCaptured', () => {
        socket.broadcast.emit('lose', `<span class="win"><strong>${socket.pseudo}</strong> a capturé le drapeau !</span>`);
        socket.emit('message', `<span class="win"> Vous avez capturé le drapeau !</span>`);
        io.emit('end',  ` <strong>${socket.pseudo}</strong> à remporté la partie `);
    });

    socket.on('disconnect', () => {
        console.log( `*** Un client à été supprimé  ${socket.pseudo}  *** `);
        socket.broadcast.emit('message', ` <strong>${socket.pseudo}</strong> vient de se déconnecter `);
        socket.broadcast.emit('remove',socket.id);
        delete(player_list[socket.id]);
        delete socket.id;
        console.log(player_list);
    });

    socket.on('removeAllPlayer', () => {
        let player_list = {};
        console.log('remove');
        console.log(player_list);
    });

    socket.on("connectMSG", (pseudo) => {
        socket.pseudo = pseudo;
        socket.broadcast.emit('message',`<strong>${socket.pseudo}</strong> vient de se connecter`); // Message vers tous les autres utilisateurs.
        let newPlayer = {
            id : socket.id,
            x : 1400,
            y : 5100,
        }
        socket.broadcast.emit('newEnemy', newPlayer);
    });

    socket.on('konami' , () => {
        socket.emit('message',` <strong>${socket.pseudo}</strong> vous avez activez le Konami Code.`);
        socket.broadcast.emit('konami', ` <strong>${socket.pseudo}</strong> vous a lancé une attaque Blinky-Gommes`);
    });
});
