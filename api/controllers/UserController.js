/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	admin: function( req, res ){	
		User.findOne( req.param('id') ).exec(function (err, usuario) {
		  if (err) { return; }
		    var data = new Object();
      		data.usuario = usuario;
		  	if (req.wantsJSON) {
				return res.json( {data} );
			}
			else {
				return res.view( {data} );
			}

		});
	},

	conversaciones: function( req, res ){
		sails.log('Trayendo conversaciones del usuario..', req.session );
		User.findOne( req.session.passport.user ).populate('conversaciones').exec(function (err, user){
		  if (err) {
		    return res.serverError(err);
		  }
		  if( user.conversaciones.length > 0 ){
		  	sails.log( "Conversaciones encontradas: ", user.conversaciones );
		  	return res.json(user.conversaciones);
		  }else{
		  	var historia_base = false;
		  	sails.controllers.user.nuevahistoria( 'inicial', req, res);
		  }
		});
	},

	conteos: function( req, res ){
		sails.log('Trayendo conteos del usuario..', req.session );
		var data = new Object();

		User.findOne( req.session.passport.user ).populate('conversaciones').populate('contactos').populate('mensajes').exec(function (err, user){
		  if (err) {
		    return res.serverError(err);
		  }

		  data.mensajes = user.mensajes.length;
		  data.contactos = user.contactos.length;
		  data.conversaciones = user.conversaciones.length;

		  return res.json(data);
		  
		});
	},

	nuevahistoria: function( historia, req, res ){
		if (!req.isSocket) {
	      return res.badRequest();
	    }

	    var socketId = sails.sockets.getId(req);

		Historia.find({ identificador: historia }).populate( 'usuario' ).exec(function (err, historia){
			if (err) {
				return res.serverError(err);
			}

			console.log( 'Nueva historia: ', historia );

			historia_base = historia[0];

		  	Conversacion.create({
		  		identificador: historia_base.identificador,
		  		nombre: historia_base.nombre,
		  		image: historia_base.image,
		  		de_usuario: req.session.passport.user,
		  		mensaje_inicial: historia_base.mensaje_inicial
		  	}).exec(function (err, conversacion){
		  	  if (err) { 
		  	  	console.log('Error creando conversacion con historia: ', historia_base );
		  	  	return res.serverError(err); 
		  	  }
		  	  console.log( 'Creando conversacion con historia: ', historia_base );
		  	  console.log( 'Adding usuario: ', req.session.passport.user );
		  	  conversacion.usuarios.add( req.session.passport.user );
		  	  console.log( 'Adding usuario: ', historia_base.usuario.id );
		  	  conversacion.usuarios.add( historia_base.usuario.id );
		  	  conversacion.save(
	  	        function(err){
	  	        	if (err) { return res.serverError(err); }
	  	        	sails.log( "Conversacion creada: ", conversacion );
	  	        	sails.sockets.broadcast( socketId, { accion: 'nueva_historia' } );
					return res.json([conversacion]);
	  	        });
		  	});
	    });
	},

	reset: function( req, res ){
		sails.log('Eliminando todas las conversaciones del usuario.');
		var conversaciones_array = [];
		User.findOne( req.session.passport.user ).populate('conversaciones').exec(function (err, user){
			for (var i = 0; i < user.conversaciones.length; i++) {
				conversaciones_array.push( user.conversaciones[i].id );
			}
			Conversacion.destroy({
			  id: conversaciones_array
			}).exec(function (err){
			  if (err) {
			    return res.negotiate(err);
			  }
			  sails.log('Se han eliminado todas las conversaciones del usuario.');
			  return res.json({ ok:true });
			});
		});
	}
};

