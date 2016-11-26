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
  	mensajes: {
  		collection: 'mensaje',
  		via: 'en_conversacion'
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

