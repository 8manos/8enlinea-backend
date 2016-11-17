/**
 * PlantillaController
 *
 * @description :: Server-side logic for managing plantillas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	find: function( req, res ){	
		Plantilla.findOne( req.param('id') ).populate('respuestas').populate('acciones').exec(function (err, plantilla) {
		  if (err) { return; }
		    var data = new Object();
      		data.plantilla = plantilla;

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

