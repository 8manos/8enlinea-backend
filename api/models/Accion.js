/**
 * Accion.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	tipo: {
  		type: 'string',
  		required: true,
  		enum: ['cambia_css', 'activa_mensaje', 'inicia_conversacion']
  	},
  	valor: {
  		type: 'string',
  		required: true
  	},
  	en_mensaje: {
  		collection: 'mensaje',
  		via: 'acciones'
  	}
  }

};