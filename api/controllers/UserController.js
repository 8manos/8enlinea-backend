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
		  	Conversacion.create({
		  		de_usuario: req.session.passport.user
		  	}).exec(function (err, conversacion){
		  	  if (err) { return res.serverError(err); }
		  	  conversacion.usuarios.add( req.session.passport.user );
		  	  conversacion.save(
	  	        function(err){
	  	        	if (err) { return res.serverError(err); }
	  	        	sails.log( "Conversacion creada: ", conversacion );
  					return res.json(conversacion);
	  	        });
		  	});
		  }
		});
	}
};

