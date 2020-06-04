let game;
// On initilise en dernier donc le fichier main est à mettre en dernier.
let gameBootstrapper = {
    init(){
        let canvas_width = window.innerWidth * window.devicePixelRatio;
        let canvas_height = window.innerHeight * window.devicePixelRatio;
        // point d'entrée du jeux
        console.log('**** Game bootstrap ****');
        game = new Phaser.Game(canvas_width, canvas_height, Phaser.AUTO, 'game');
        game.state.add('Game',Game);
        game.state.start('Game');
    }
};

let $ = (selector) => {
    let $;
    $ = document.querySelector(selector);
    return $;
}

let event = (variable, eventType, callback) => {
    event = variable.addEventListener(eventType, callback);
    return event;
}

$(".loader").style.display = "none";

    let verifPseudo = (e) => {
        value = $("#pseudo").value;
        value = value.trim();

        let modal = $('.modal-body');
        let error = document.createElement('p');
        if (value.length === 0 ) {
            error = modal.insertBefore(error, $('.label-pseudo'));
            error.innerHTML = "<strong>!</strong> Le champs est vide";
            error.classList = "alert-danger";
        } else{
            Client.socket.emit('connectMSG', value);
            modalPseudo.style.display = 'none';
            gameBootstrapper.init();
            $(".loader").style.display = "block";
        }
        return value;
    }

let modalPseudo = $(".modal");
modalPseudo.style.display = 'block';
modalPseudo.style.opacity = '1';

let btnModal = $("#btn");
btnModal = event(btnModal, "click", verifPseudo);
