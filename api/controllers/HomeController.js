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
      sails.log('Rendering home');
      res.view({ title: "Bienvenido a 8enlinea", data });
    });
  },

  subscribeToIntro: function(req, res) {
    if (!req.isSocket) {
      return res.badRequest();
    }

    var socketId = sails.sockets.getId(req);

    sails.log('My socket ID is: ' + socketId);

    timed = setTimeout( function () {
      sails.sockets.broadcast( socketId, { greeting: 'Hola 30 segundos despues!', socketId: socketId });
    }, 30000);

    return res.json(socketId);
  }

};

