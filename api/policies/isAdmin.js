// policies/isAdmin.js
module.exports = function (req, res, next) {

  var is_admin = false;

  // If the requesting user is not logged in, then they are _never_ allowed to write.
  // No reason to continue-- we can go ahead and bail out now.
  if (!req.session.authenticated) {
    return res.redirect('/login');
  }

  // Check the database to see if a permission record exists which matches both the
  // target folder id, the appropriate "type", and the id of the logged-in user.
  User.find({
    id: [req.user.id]
  })
  .populate('roles')
  .exec(function (err, permission) {
    // Unexpected error occurred-- use the app's default error (500) handler.
    //
    // > We do this because this should never happen, and if it does, it means there
    // > is probably something wrong with our database, and we want to know about it!)
    if (err) { return res.serverError(err); }

    // No "write" permission record exists linking this user to this folder.
    // Maybe they got removed from it?  Or maybe they never had permission in the first place...
    if (!permission) {
      return res.redirect('/login');
    }

    for (var i = permission[0].roles.length - 1; i >= 0; i--) {
      if( permission[0].roles[i].name === "admin" ){
        is_admin = true;
      }
    }

    // If we made it all the way down here, looks like everything's ok, so we'll let the user through.
    // (from here, the next policy or the controller action will run)
    if( is_admin ){
      return next();
    }else{
      return res.redirect('/');
    }
  });
};