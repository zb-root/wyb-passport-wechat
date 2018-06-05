let passport = require('passport')
let Strategy = require('passport-local').Strategy

module.exports = function (service, opts) {
  passport
    .use(new Strategy(
      function (username, password, cb) {
        service.user.post('/signon', {username: username, password: password})
          .then(function (doc) {
            if (!doc.err) return service.sso.post('/signon', doc)
            return doc
          })
          .then(function (doc) {
            cb(null, doc)
          })
          .catch(cb)
      }))
  return passport
}
