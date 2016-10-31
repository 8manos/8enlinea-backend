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

  subscribeToIntro: function(req, res) {
    if (!req.isSocket) {
      return res.badRequest();
    }

    var socketId = sails.sockets.getId(req);

    sails.log('My socket ID is: ' + socketId);

    if( req.session.authenticated !== "undefined" ){
      timed = setTimeout( function () {
        sails.sockets.broadcast( socketId, { greeting: req.session.authenticate + 'Hola persona nueva 3 segundos despues!', socketId: socketId });
      }, 3000);
    }else{
      timed = setTimeout( function () {
        sails.sockets.broadcast( socketId, { greeting: req.session.authenticate + 'Hola persona conocida 3 segundos despues!', socketId: socketId });
      }, 3000);
    }

    return res.json(socketId);
  }

};

