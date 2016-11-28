/**
 * Conversacion.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    nombre:{
      type: 'string'
    },
    image: {
        type: 'string'
    },
    identificador:{
      type: 'string'
    },
    mensaje_inicial: {
      type: 'string',
      required: true
    },
  	mensajes: {
  		collection: 'mensaje',
  		via: 'en_conversacion'
  	},
    respuestas: {
      collection: 'respuesta',
      via: 'de_conversacion'
    },
    alternativas :{
      collection: 'alternativa',
      via: 'en_conversacion'
    },
  	de_usuario: {
  		collection: 'user',
  		via: 'conversaciones'
  	},
  	usuarios: {
  		collection: 'user',
  		via: 'en_conversacion'
  	}
  }
};

