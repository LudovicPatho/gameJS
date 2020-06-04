let map;
let flag;
let backGroundImage;
let player= {};
player.score = 0;
let idPlayer;
let score =  player.score;
let enemy;
let playerMap= {};
let cursor;
let layer;
let speed = 700;
let jumping = false;
let jumps = 3;
let jumpSpeed = -900;
let acceleration = 2000;
let worldGravity =2600;//2600
let drag = 1600;
let stage = 1;
let topJumps = 0;
let isGame =  false;
let gameProperties = {
gameWidth: 2800,
gameHeight:5600,
in_game: false
};

    let Game = {
    init() {
        console.log(`*** Init du jeux ***`);},

    preload() {
        this.loadStage();},

    create () {
        this.createMap();
        Client.newPlayer(1400, 5100);},

    createMap() {
        this.stageCreate();},

    update() {
        if (isGame) {
            this.movePlayer();
        }
    },

    /**
    *  Loading et construction des stages
    */

    loadStage() {
        if (stage === 1){
            game.load.tilemap('map',  './client/assets/map/map1/map1.json', null, Phaser.Tilemap.TILED_JSON);
            game.load.image('ground', './client/assets/map/map1/ground.png');
            game.load.image('bonus',  './client/assets/map/map1/bonus.png');
            game.load.image('bonus_used',  './client/assets/map/map1/bonus.png');
            game.load.image('block', './client/assets/map/map1/block.png');
            game.load.image('crate', './client/assets/map/map1/crate.png');
            game.load.spritesheet('sprite', './client/assets/img/sprite.png', 64, 64);
            game.load.image('ground_dirt', './client/assets/map/map1/ground_dirt.png');
            game.load.image('winFlag', './client/assets/map/map1/coin_gold.png');
            game.load.image('bg', './client/assets/map/map1/bg.png');
            game.load.spritesheet('sprite2', './client/assets/map/map1/boulDead.png', 256, 256);
            }
        game.load.start();
    },

    /**
    * Creation des stages
    */

    stageCreate() {
        if (stage === 1) {
            game.add.tileSprite(0, 0, 2800, 5600, 'bg');
            map = game.add.tilemap('map');
            map.addTilesetImage('ground');
            map.addTilesetImage('bonus');
            map.addTilesetImage('bonus_used');
            map.addTilesetImage('block');
            map.addTilesetImage('crate');
            map.addTilesetImage('ground_dirt');
            map.setCollisionBetween(1,3);
            map.setCollision(5);
            map.setTileIndexCallback(4, Game.bonus, this);
            layer = map.createLayer('ground');
            layer.resizeWorld();
            flag = game.add.sprite(2700, 100, 'winFlag');

            /**
            * Physic
            */

            game.physics.startSystem(Phaser.Physics.ARCADE);
            game.physics.arcade.gravity.y = worldGravity;
            game.physics.arcade.enable(flag);
            flag.body.collideWorldBounds = true;
            flag.body.gravity.y = -worldGravity;
            game.world.setBounds(0, 0, gameProperties.gameWidth, gameProperties.gameHeight);
            cursors = game.input.keyboard.createCursorKeys();
            jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
            game.input.keyboard.addKeyCapture([
            Phaser.Keyboard.LEFT,
            Phaser.Keyboard.RIGHT,
            Phaser.Keyboard.UP,
            Phaser.Keyboard.DOWN,
            Phaser.Keyboard.SPACEBAR]);
            document.querySelector(".loader").style.display = "none";

            /**
            * CPU Enemies
            */

            ballsDead = game.add.group();
            ballDead = ballsDead.create(70, 58*70, 'sprite2',0);
            // On multiplie par 70 pour avoir la carte en coordonées de tileset.
            ballDead.enableBody = true;
            ballDead2 = ballsDead.create(11*70, 5*70, 'sprite2',0); // On multiplie par 70 pour avoir la carte en coordonées (tiles) et 0 pour le choix du sprite
            ballDead2.enableBody = true;
            ballDead2.scale.setTo(0.75, 0.75);
            game.physics.enable(ballsDead, Phaser.Physics.ARCADE);
            ballDead.body.setCircle(120);
            ballDead.body.bounce.set(0.8);
            ballDead2.body.setCircle(120);
            ballDead2.body.bounce.set(0.8);
            ballDead.body.gravity.y = -2600;
            ballDead2.body.gravity.y = -2600;
            let tween = game.add.tween(ballDead).to( { x: 580 }, 2000, "Linear", true, 0, -1);
            tween.yoyo(true, 1000);
            let tween2 = game.add.tween(ballDead2).to( { x: 38*64 }, 4000, "Linear", true, 0, -1);
            tween2.yoyo(true, 1000);
        }
    },

    /**
    * Création du joueur
    */

    createPlayer(id)  {
        idPlayer = id;
        player = game.add.sprite(1400, 5100, 'sprite', 2);
        player.animations.add('left', [0]);
        player.animations.add('center', [1]);
        player.animations.add('right', [2]);
        player.animations.add('up', [3]);
        player.animations.add('down', [4]);
        player.anchor.setTo(0.5,0.5);
        game.physics.enable(player);
        player.body.collideWorldBounds = true;
        player.body.allowGravity = true;
        player.body.mass = 0;
        player.body.maxVelocity.setTo(speed, speed * 1.5);
        player.body.drag.setTo(drag, 0);
        player.body.immovable = true;
        player.body.wasTouching.left =true;
        game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.5, 0.5);
        isGame =  true;
    },

    /**
    * Déplacement du joueur
    */

    movePlayer() {
        game.physics.arcade.collide(player, layer);
        game.physics.arcade.overlap(player, flag, Game.win, null, this);
        game.physics.arcade.overlap(player, ballsDead, Game.dead, null, this);

        player.play('center');
        /**
        * Direction avec le clavier
        */
        if (this.leftInputIsActive()) {
            player.body.acceleration.x = -acceleration;
            player.play('left');
        } else if (this.rightInputIsActive()) {
            player.body.acceleration.x = acceleration;
            player.play('right');
        } else {
            player.body.acceleration.x = 0;}

        /**
        *  jump permet jusqu'à 3 sauts de suite. Il faut retoucher le sol pour pouvoir resauter
        */

        if (jumps > 0 && this.upInputIsActive(5)) {
            player.play('up');
            player.body.velocity.y = jumpSpeed ;
            jumping = true;}

        if (jumping && this.upInputReleased()) {
            jumps--;
            jumping = false;
        } else {
            player.body.gravity.y = 0;
            player.scale.x = 1;
            player.body.allowGravity = true;
            player.body.acceleration.y =0;}

        if (player.body.onFloor()) {
            jumps = 3;
            jumping = false;
        }
            Client.move(player.x,player.y);
    },

    leftInputIsActive () {
        let isActive = false;
        isActive = game.input.keyboard.isDown(Phaser.Keyboard.LEFT);
        return isActive;
    },

    rightInputIsActive() {
        let isActive = false;
        isActive = game.input.keyboard.isDown(Phaser.Keyboard.RIGHT);
        return isActive;
    },

    upInputIsActive (duration) {
        let isActive = false;
        isActive = game.input.keyboard.downDuration(Phaser.Keyboard.UP, duration);
        return isActive;
    },

    upInputReleased () {
        let released = false;
        released = game.input.keyboard.upDuration(Phaser.Keyboard.UP);
        return released;
    },

    /**
    * Création des enemies
    */

    createEnemy (data) {
        if(data.id != idPlayer){
            let enemy = {
                id : data.id,
                x : data.x,
                y : data.y,
                pseudo : data.pseudo
            }
        playerMap[enemy.id] = game.add.sprite(enemy.x, enemy.y, 'sprite', 1);
        playerMap[enemy.id].alpha = 0.5;
        playerMap[enemy.id].anchor.setTo(0.5,0.5);
        }
    },

    enemyMove(data) {
        if(playerMap[data.id]){
            playerMap[data.id].x = data.x;
            playerMap[data.id].y = data.y;
        }
    },

    removePlayer(id) {
        if(playerMap[id]){
            playerMap[id].kill();
            delete(playerMap[id]);
        } else {
            console.log('un utilisateur inconnu s est déconnecté');
        }
    },

    removeAllEnemies () {
        for (id in playerMap) {
            playerMap[id].kill();
            delete(playerMap[id]);
        }
    },

    /**
    * Bonus et score
    */

    dead() {
        let randomWidth = Math.floor(Math.random() * gameProperties.gameWidth) ;
        player.x = randomWidth;
        player.y = 5400;
        player.body.velocity.y = 0;
        player.body.velocity.x = 0;
        player.score = 0;
        score = 0;
        speed = 0;
        let tween = game.add.tween(player).to( { alpha: 0.3 }, 100, "Linear", true, 0, -1);
        tween.yoyo(true,0);
        tween.repeat(10, 0);
        //scoreText.text = "Score : " + player.score;
        game.time.events.add(Phaser.Timer.SECOND * 2,  Game.restartPlayer, this);
        Client.move(player.x,player.y);
    },

    restartPlayer() {
        speed = 650;
    },

    bonus (sprite,tile){
        tile.alpha = 0;
        tile.index = 0;
        layer.dirty = true;
    },

    win () {
        flag.kill();
        console.log('gagné');
        Client.flagCaptured();
    },

    end (message) {
        isGame = false;
        Client.removeAllPlayer ();
        this.removeAllEnemies();

        player.kill();

        let seconde = 5;
        game.time.events.add(Phaser.Timer.SECOND * seconde, Game.restartGame, this);

        let end =document.querySelector(".end");
        end.style.display = 'flex';
        let h2 = document.createElement("h2");
        end.innerHTML = "";
        h2.innerHTML = `${message} <br > Le jeu va redemarer dans ${seconde} secondes`;
        end.appendChild(h2);
        seconde -= 1;
        let stopWatch = () => {
            h2.innerHTML =  `${message} <br > Le jeu va redemarer dans ${seconde} secondes`;
            end.appendChild(h2);
            seconde -= 1;}
        game.time.events.repeat(Phaser.Timer.SECOND * 1, seconde, stopWatch, this);

    },

    restartGame() {
        this.game.state.restart();
        let end =document.querySelector(".end");
        end.style.display = 'none';
    }
};// Fin de l'objet Game

