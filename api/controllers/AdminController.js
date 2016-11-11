/**
 * AdminController
 *
 * @description :: Server-side logic for managing admins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  /**
   * `AdminController.home()`
   */
  home: function (req, res) {
    if (req.isSocket) {
      return res.badRequest();
    }
    return res.view();
  },

  /**
   * `AdminController.usuarios()`
   */
  usuarios: function (req, res) {
    if (req.isSocket) {
      return res.badRequest();
    }
    User.find().exec(function(err, usuarios) {
      var data = new Object();
      data.usuarios = usuarios;
      res.view({ data });
    });
  },

  /**
   * `AdminController.plantillas()`
   */
  plantillas: function (req, res) {
    if (req.isSocket) {
      return res.badRequest();
    }
    Plantilla.find().populate('autor').exec(function(err, plantillas) {
      var data = new Object();
      data.plantillas = plantillas;
      User.find().exec(function(err,usuarios){
        data.usuarios = usuarios;
        console.log('Sending: ', data );
        res.view({ data });
      });
    });
  }
};

