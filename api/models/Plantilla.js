/**
 * Mensaje.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	identificador: {
  		type: 'string',
  		required: true,
  		unique: true
  	},
  	mensaje: {
  		type: 'longtext',
  		required: true
  	},
  	estado: {
  		type: 'string',
  		defaultsTo: 'escribiendo',
  		enum: ['pendiente', 'escribiendo', 'enviado', 'leido', 'respondido']
  	},
  	tiempo_escribiendo: {
  		type: 'integer',
  		defaultsTo: 5000
  	},
  	tiempo_respuesta: {
  		type: 'integer',
  		defaultsTo: 10000
  	},
  	respuestas: {
  		collection: 'respuesta',
  		via: 'de_plantilla'
  	},
  	detonador: {
  		collection: 'respuesta',
  		via: 'destino'
  	}
  }
};
