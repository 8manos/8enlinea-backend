/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
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

		  	Historia.find({ identificador: 'inicial' }).populate( 'usuario' ).exec(function (err, historia){
				if (err) {
					return res.serverError(err);
				}

				console.log( 'Historia: ', historia );

				historia_base = historia[0];

			  	Conversacion.create({
			  		identificador: historia_base.identificador,
			  		nombre: historia_base.nombre,
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
	  					return res.json([conversacion]);
		  	        });
			  	});
		    });


		  }
		});
	}
};

