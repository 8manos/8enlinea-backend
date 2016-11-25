/**
 * ConversacionController
 *
 * @description :: Server-side logic for managing conversaciones
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	find: function( req, res ){	
		Conversacion.findOne( req.param('id') ).populate('mensajes').populate('usuarios').populate('alternativas').exec(function (err, conversacion) {
		  if (err) { return; }
		    var data = new Object();
      		data.conversacion = conversacion;

		  	if (req.wantsJSON) {
				return res.json( {data} );
			}
			else {
				return res.view( {data} );
			}

		});
	},

	subscribe: function( req, res ){
	  if (!req.isSocket) {
	    return res.badRequest();
	  }

	  var roomName = req.param('id');
	  sails.sockets.join(req, roomName, function(err) {
	    if (err) {
	      return res.serverError(err);
	    }

	    return res.json({
	      message: 'Subscribed to conversacion '+roomName+'!'
	    });
	  });
	},

	unsubscribe: function( req, res ){
	  if ( _.isUndefined(req.param('id')) ) {
	    return res.badRequest('id is required.');
	  }

	  if (!req.isSocket) {
	    return res.badRequest('This endpoint only supports socket requests.');
	  }

	  var roomName = req.param('id');
	  sails.sockets.leave(req, roomName, function(err) {
	    if (err) {return res.serverError(err);}
	    return res.json({
	      message: 'Left conversacion '+roomName+'!'
	    });
	  });		
	},

	responder: function (req, res) {
		sails.log( 'El usuario ' + req.session.id + 'ha solicitado el destino: ', req.param('destino') );
		Plantilla.find({ identificador: req.param('destino') }).populate('respuestas').populate('acciones').exec(function (err, plantilla) {
		  if (err) {
		    // uh oh
		    // (handle error; e.g. `return res.negotiate()`)
		    return;
		  }

		  return res.json( { plantilla:plantilla[0] } );

		});
	}
};

