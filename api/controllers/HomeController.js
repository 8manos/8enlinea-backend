/**
 * HomeController
 *
 * @description :: Server-side logic for managing homes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	
  /**
   * `HomeController.index()`
   */
  index: function (req, res) {
    Mensaje.find().exec(function(err, mensajes) {
      var data = new Object();
      data.mensajes = mensajes;
      data.opciones = new Object();
      res.json({ data });
    });
  },

  login: function(req, res) {
    res.view('403');
  },

  subscribeToIntro: function(req, res) {
    if (!req.isSocket) {
      return res.badRequest();
    }

    var socketId = sails.sockets.getId(req);

    sails.log('My socket ID is: ' + socketId);

    sails.log("Sesion: ", req.session.authenticated );

    if( req.session.authenticated ){
      timed = setTimeout( function () {
        sails.sockets.broadcast( socketId, { greeting: 'Parece que ya nos conocemos, espera mientras cargamos tus conversaciones', socketId: socketId });
      }, 3000);
    }else{
      timed = setTimeout( function () {
        sails.sockets.broadcast( socketId, { greeting: 'Parece que aún no nos conocemos, quieres iniciar sesión?', socketId: socketId });
      }, 3000);
    }

    return res.json(socketId);
  }

};

