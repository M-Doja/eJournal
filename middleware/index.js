module.exports = function(req, res, next, err) {
  res.locals.currentUser = req.user;
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
}
