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
    return res.json({
      todo: 'usuarios() is not implemented yet!'
    });
  },


  /**
   * `AdminController.plantillas()`
   */
  plantillas: function (req, res) {
    return res.json({
      todo: 'plantillas() is not implemented yet!'
    });
  }
};

