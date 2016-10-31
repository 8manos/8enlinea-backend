/**
 * Mensaje.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
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
  	en_conversacion: {
  		collection: 'conversacion',
  		via: 'mensajes'
  	},
  	autor:{
      model:'user',
      unique: true
    },
    acciones:{
      model: 'accion',
      via: 'en_mensaje'
    }
  }

};

