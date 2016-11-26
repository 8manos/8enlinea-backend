/**
 * ConversacionController
 *
 * @description :: Server-side logic for managing conversaciones
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var _ = require('lodash');

module.exports = {
	find: function( req, res ){	
		Conversacion.findOne( req.param('id') ).populate('mensajes').populate('respuestas').populate('usuarios').populate('alternativas').exec(function (err, conversacion) {
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
	},

	agregar: function (req, res) {
		sails.log( 'El usuario ' + req.session.passport.user + ', en la conversacion: '+ req.param('conversacion') +' ha solicitado agregar el mensaje: ', req.param('plantilla') );
		var plantilla_base = false;
		var conversacion_base = false;
		var mensaje_base = false;

		Plantilla.find({ identificador: req.param('plantilla') }).populate('autor').populate('respuestas').populate('acciones').exec(function (err, plantilla) {
		  if (err) {
		    // uh oh
		    console.log('Se ha solicitado una plantilla que no existe. Revisar identificador.')
		    return;
		  }

		  plantilla_base = plantilla[0];

		  Conversacion.findOne( req.param('conversacion') ).populate('respuestas').exec(function (err, conversacion){
		    if (err) {
		      return res.serverError(err);
		    }
		    if (!conversacion) {
		      return res.notFound('Conversacion no encontrada');
		    }
		    conversacion_base = conversacion;

		    console.log('Creando mensaje desde plantilla base: ', plantilla_base );
		    Mensaje.create({
			  	mensaje: plantilla_base.mensaje ,
			  	estado: plantilla_base.estado ,
			  	multimedia: plantilla_base.multimedia ,
			  	tiempo_escribiendo: plantilla_base.tiempo_escribiendo ,
			  	tiempo_respuesta: plantilla_base.tiempo_respuesta ,
			  	autor: plantilla_base.autor
			}).exec(function ( err, mensaje ){
		      if (err) { return res.serverError(err); }

		      console.log( 'Nuevo mensaje creado: ', mensaje );

		      Mensaje.findOne( mensaje.id ).populate('respuestas').populate('acciones').exec(function( err, mensaje ){
			      
			      console.log( 'Nuevo mensaje encontrado: ', mensaje );
			      
			      mensaje_base = mensaje;
			      if( plantilla_base.acciones.length ){
					for (var i = 0; i < plantilla_base.acciones.length; i++) {
						mensaje_base.acciones.add( plantilla_base.acciones[i].id );
					} 
			      }

			      if( plantilla_base.respuestas.length ){
					for (var i = 0; i < plantilla_base.respuestas.length; i++) {
						mensaje_base.respuestas.add( plantilla_base.respuestas[i].id );
					} 
			      }

			      mensaje.save( function(err){
			      	if (err) { console.log( 'Falló asignacion de asosiacioens a mensaje.'); }
			      	//ok 
			      	conversacion_base.mensajes.add( mensaje_base.id );
			      	conversacion_base.save( function(err){
			      		if (err) { console.log( 'Falló asignacion de mensaje a conversacion.'); }

			      		if( conversacion_base.respuestas.length ){
			      			for (var i = 0; i < conversacion_base.respuestas.length; i++) {
			      				conversacion_base.respuestas.remove( conversacion_base.respuestas[i].id );
			      			}
		    				conversacion_base.save( function(err){
		    					if (err) { console.log( 'Falló remocion de respuestas en conversacion.'); }       // Don't forget to handle your errors.
		    					
		    					if( plantilla_base.respuestas.length ){
									for (var i = 0; i < plantilla_base.respuestas.length; i++) {
										conversacion_base.respuestas.add( plantilla_base.respuestas[i].id );
										conversacion_base.save( function(err){
											if (err) { console.log( 'Falló asignación de respuestas en conversacion.'); }
											sails.sockets.broadcast( conversacion_base.id, 'nuevo_mensaje', { conversacion: conversacion_base, mensaje: mensaje_base });
			        						res.json({ mensaje: mensaje_base });
										});
									} 
							    }

		    				});
			      		} else if( plantilla_base.respuestas.length ){
							for (var i = 0; i < plantilla_base.respuestas.length; i++) {
								conversacion_base.respuestas.add( plantilla_base.respuestas[i].id );
								conversacion_base.save( function(err){
									if (err) { console.log( 'Falló asignación de respuestas en conversacion.'); }
									sails.sockets.broadcast( conversacion_base.id, 'nuevo_mensaje', { conversacion: conversacion_base, mensaje: mensaje_base });
	        						res.json({ mensaje: mensaje_base });
								});
							} 
					    } else {
					    	sails.sockets.broadcast( conversacion_base.id, 'nuevo_mensaje', { conversacion: conversacion_base, mensaje: mensaje_base });
	        				res.json({ mensaje: mensaje_base });
					    }

			        });
			      });

		      });
		    // mensaje create fin  
		    });
		  });

		});
	}
};

