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
    res.view();
  },

  login: function(req, res) {
    res.view('403');
  },

  ping: function(req, res) {
    if (!req.isSocket) {
      return res.badRequest();
    }
    return res.json( {ok: true} );
  },

  subscribeToIntro: function(req, res) {
    if (!req.isSocket) {
      return res.badRequest();
    }

    var socketId = sails.sockets.getId(req);

    sails.log('My socket ID is: ' + socketId);

    sails.log("Sesion: ", req.session.authenticated );

    
    if( req.session.authenticated ){
      var intro = 'intro_logged_in';
    }else{
      var intro = 'intro_logged_out';
    }
    

    Plantilla.find({ identificador: intro }).populate('respuestas').populate('autor').populate('acciones').exec(function (err, plantilla){
      if (err) {
        return res.serverError(err);
      }
      timed2 = setTimeout( function () {
        sails.log('emitiendo plantilla');
        sails.sockets.broadcast( socketId, { plantilla: plantilla[0], socketId: socketId });
      }, 2000);
      return res.json(plantilla);
    });
  }

};

