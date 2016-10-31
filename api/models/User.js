var _ = require('lodash');
var _super = require('sails-permissions/api/models/User');

_.merge(exports, _super);
_.merge(exports, {

  // Extend with custom logic here by adding additional fields, methods, etc.
  attributes: {
    name: {
    	type: 'string'
    },
    conversaciones: {
    	collection: 'conversacion',
    	via: 'de_usuario'
    },
    mensajes: {
    	collection: 'mensaje',
    	via: 'autor'
    },
    en_conversacion: {
    	collection: 'conversacion',
    	via: 'usuarios'
    }
  }
});