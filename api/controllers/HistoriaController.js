/**
 * HistoriaController
 *
 * @description :: Server-side logic for managing historias
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	admin: function( req, res ){	
		Historia.findOne( req.param('id') ).populate('usuario').exec(function (err, historia) {
		  if (err) { return; }
		    var data = new Object();
      		data.historia = historia;

      		User.find().exec(function(err,usuarios){
      			if (err) { return; }
        		data.usuarios = usuarios;
				  	if (req.wantsJSON) {
						return res.json( {data} );
					}
					else {
						return res.view( {data} );
					}
				}
			);

		});
	}
};

