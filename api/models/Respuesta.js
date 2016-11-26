/**
 * Respuesta.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	tipo: {
  		type: 'string',
  		required: true,
  		enum: ['texto', 'input', 'radio'],
  		defaultsTo: 'texto'
  	},
  	texto: {
  		type: 'longtext',
  		required: 'true'
  	},
  	destino: {
  		type: 'string'
  	},
  	de_plantilla: {
  		collection: 'plantilla',
  		via: 'respuestas'
  	},
    de_mensaje: {
      collection: 'mensaje',
      via: 'respuestas'
    },
    de_conversacion: {
      collection: 'conversacion',
      via: 'respuestas'
    }
  }
};

