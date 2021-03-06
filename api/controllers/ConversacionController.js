/**
 * ConversacionController
 *
 * @description :: Server-side logic for managing conversaciones
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var _ = require('lodash');

module.exports = {
	find: function( req, res ){	
		
		var mensajes_array = [];
		var data = new Object();
		
		Conversacion.findOne( req.param('id') ).populate('mensajes').populate('respuestas').populate('usuarios').populate('alternativas').exec(function (err, conversacion) {
		  if (err) { return; }
		  if( typeof(conversacion) == 'undefined' ) {
		  	console.log('Se ha solicitado una conversacion que no existe.');
		  	return;
		  }
		  	data.conversacion = conversacion;
		  	for (var i = 0; i < conversacion.mensajes.length; i++) {
				mensajes_array.push( conversacion.mensajes[i].id ); 
			}
			Mensaje.find().where({id: mensajes_array}).populate('autor').exec(function (err, mensajes) {
		  		
		  		data.conversacion.mensajes = mensajes;
				return res.json( {data} );

		    });

		});
	},

	detalles: function( req, res ){
		sails.log('Trayendo detalles de conversacion: ', req.param('id') );

		Conversacion.findOne( req.param('id') ).populate('usuarios').populate('mensajes', { multimedia: { startsWith: 'http' } }).exec(function (err, conversacion) {
		  if (err) {
		    sails.log('Error trayendo detalles de conversación.');
		    return;
		  }
		  res.json( conversacion );
		});
	},

	findmensajes: function( req, res ){
		var mensajes_array = [];

		Conversacion.findOne( req.param('id') ).populate('mensajes').exec(function (err, conversacion) {
			for (var i = 0; i < conversacion.mensajes.length; i++) {
				mensajes_array.push( conversacion.mensajes[i].id ); 
			}
			Mensaje.find().where({id: mensajes_array}).populate('autor').populate('acciones').exec(function (err, mensajes) {
		        res.json( mensajes );
		    });
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

	agregarmensaje: function( usuario, mensaje, conversacion, req, res ){
		sails.log( 'El usuario ' + usuario + ', en la conversacion: '+ conversacion +' ha solicitado agregar el mensaje: ', mensaje );
		var plantilla_base = false;
		var conversacion_base = false;
		var mensaje_base = false;

		Plantilla.find({ identificador: mensaje }).populate('autor').populate('respuestas').populate('acciones').exec(function (err, plantilla) {
		  if (err || plantilla.length == 0 ) {
		    // uh oh
		    console.log('Se ha solicitado una plantilla que no existe. Revisar identificador.')
		    return;
		  }

		  console.log('Se encontró y usará la plantilla: ', plantilla );
		  plantilla_base = plantilla[0];

		  Conversacion.findOne( conversacion ).populate('respuestas').exec(function (err, conversacion){
		    if (err) {
		      return res.serverError(err);
		    }
		    if (!conversacion) {
		      return res.notFound('Conversacion no encontrada');
		    }
		    conversacion_base = conversacion;
		    console.log( 'Conversacion base: ', conversacion_base );
		    console.log('Creando mensaje desde plantilla base: ', plantilla_base );
		    Mensaje.create({
			  	mensaje: plantilla_base.mensaje || '',
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

			      		var timed1 = setTimeout( function(){
			      			sails.log( 'Cambiando estado de mensaje a: escribiendo');
			      			Mensaje.update( mensaje_base.id , {estado:'escribiendo'} ).exec(function afterwards(err, updated){
			      			  if (err) {
			      			    return res.negotiate(err);
			      			  }
			      			  sails.log('Updated mensaje to estado: ' + updated[0].estado );
			      			  sails.sockets.broadcast( conversacion_base.id, 'nuevo_mensaje', { accion: 'nuevo_mensaje' });
			      			  var timed2 = setTimeout(function(){
			      			  	sails.log( 'Cambiando estado de mensaje a: enviado');
			      			  	Mensaje.update( mensaje_base.id , {estado:'enviado'} ).exec(function afterwards(err, updated){
				      			  if (err) {
				      			    return res.negotiate(err);
				      			  }
				      			  sails.log('Updated mensaje to estado: ' + updated[0].estado );
				      			  sails.sockets.broadcast( conversacion_base.id, 'nuevo_mensaje', { accion: 'nuevo_mensaje' });
				      			
				      			  //Envia acciones una vez enviado el mensaje
				      			  Mensaje.findOne( mensaje_base.id ).populate('acciones').exec(function (err, mensaje) {
				      			    if (err) {
				      			      return;
				      			    }
				      			    sails.log('Enviando acciones por socket...');
				      			    for (var i = 0; i < mensaje.acciones.length; i++) {
				      			    	if( mensaje.acciones[i].tipo == 'nuevo_toast' ){
				      			    		sails.sockets.broadcast( sails.sockets.getId(req), 'nuevo_toast', { toast: mensaje.acciones[i] });
				      			    	}else if( mensaje.acciones[i].tipo == 'activa_mensaje' ){
				      			    		sails.log('Activando mensaje desde socket: ', mensaje.acciones[i] );
				      			    		sails.controllers.conversacion.agregarmensaje( req.session.passport.user, mensaje.acciones[i].parametro, conversacion_base.id, req, res );
				      			    	}else{
				      			    		sails.sockets.broadcast( conversacion_base.id, 'nueva_accion', { accion: 'nueva_accion', conversacion: conversacion_base.id, comando: mensaje.acciones[i] });		
				      			    	}
				      			    }
				      			  });

				      			});
			      			  }, plantilla_base.tiempo_escribiendo*1000 );
			      			});
			      		}, plantilla_base.tiempo_respuesta*1000 );

			      		Conversacion.findOne( conversacion_base.id ).populate('respuestas').exec(function (err, conversacion ){
							if (err) {
								return res.serverError(err);
							}
							conversacion_base = conversacion;
			      			console.log('Revisando si esta conversacion tiene respuestas: ', conversacion_base );
				      		if( conversacion_base.respuestas.length > 0 ){
				      			console.log('La conversacion ya tenía respuestas... Eliminando.')
				      			for (var i = 0; i < conversacion_base.respuestas.length; i++) {
				      				conversacion_base.respuestas.remove( conversacion_base.respuestas[i].id );
				      			}
			    				conversacion_base.save( function(err){
			    					if (err) { console.log( 'Falló remocion de respuestas en conversacion.'); }       // Don't forget to handle your errors.
			    					
			    					if( plantilla_base.respuestas.length ){
			    						console.log( 'Agregando opciones de respuesta desde plantilla.');
										for (var i = 0; i < plantilla_base.respuestas.length; i++) {
											conversacion_base.respuestas.add( plantilla_base.respuestas[i].id );
										} 
										conversacion_base.save( function(err){
											if (err) { console.log( 'Falló asignación de respuestas en conversacion.'); }
											sails.sockets.broadcast( conversacion_base.id, 'nuevo_mensaje', { accion: 'nuevo_mensaje', conversacion: conversacion_base, mensaje: mensaje_base });
			        						res.json({ mensaje: mensaje_base });
										});
								    }

			    				});
				      		} else if( plantilla_base.respuestas.length ){
				      			console.log( 'No habia respuestas, agregando opciones de respuesta desde plantilla.');
								for (var i = 0; i < plantilla_base.respuestas.length; i++) {
									conversacion_base.respuestas.add( plantilla_base.respuestas[i].id );
								} 
								conversacion_base.save( function(err){
									if (err) { console.log( 'Falló asignación de respuestas en conversacion.'); }
									sails.sockets.broadcast( conversacion_base.id, 'nuevo_mensaje', { accion: 'nuevo_mensaje', conversacion: conversacion_base, mensaje: mensaje_base });
		    						res.json({ mensaje: mensaje_base });
								});
						    } else {
						    	sails.sockets.broadcast( conversacion_base.id, 'nuevo_mensaje', { accion: 'nuevo_mensaje', conversacion: conversacion_base, mensaje: mensaje_base });
		        				res.json({ mensaje: mensaje_base });
						    }
			      		});

			        });
			      });

		      });
		    // mensaje create fin  
		    });
		  });

		});
	},

	agregar: function (req, res) {

		sails.controllers.conversacion.agregarmensaje( req.session.passport.user, req.param('plantilla'), req.param('conversacion'), req, res );
	
	},

	nueva: function (req, res) {
		sails.controllers.user.nuevahistoria( req.param('historia'), req, res);
	},

	agregarespuesta: function(req, res) {
		console.log( "Intentando agregar respuesta " + req.param('destino') + " en conversacion", req.param('id')  );
		var conversacion_base = false;

		Conversacion.findOne( req.param('id') ).populate('mensajes').exec(function (err, conversacion){
		    if (err) {
		      return res.serverError(err);
		    }
		    if (!conversacion) {
		      return res.notFound('Conversacion no encontrada');
		    }
		    conversacion_base = conversacion;
		    console.log('Creando mensaje desde respuesta: ', req.param('texto') );
		    Mensaje.create({
			  	mensaje: req.param('texto') ,
			  	estado: 'enviado',
			  	autor: req.session.passport.user
			}).exec(function ( err, mensaje ){
				console.log('Mensaje creado desde respuesta: ', mensaje );
				conversacion_base.mensajes.add( mensaje.id );
			    conversacion_base.save( function(err){
			    	sails.sockets.broadcast( conversacion_base.id, 'nuevo_mensaje', { accion: 'nuevo_mensaje' });
					sails.controllers.conversacion.agregarmensaje( req.session.passport.user, req.param('destino'), req.param('id'), req, res );
			    	res.json({ mensaje: 'respuesta agregada.' });
			    });
			});
		});
	}
};

