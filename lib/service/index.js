let OAuth = require('wechat-oauth')
let jm = require('jm-dao')
let MS = require('jm-ms')
let ms = MS()
let UserWechat = require('./user')

module.exports = function (opts) {
  let db = opts.db
  let o = {
    config: opts,
    oauth: new OAuth(opts.appid, opts.appsecret)
  }
  let bind = function (name, uri) {
    uri || (uri = '/' + name)
    ms.client({
      uri: opts.gateway + uri
    }, function (err, doc) {
      !err && doc && (o[name] = doc)
    })
  }

  bind('sso')
  bind('user')

  o.passport = require('./passport')(o)

  let cb = function (db) {
    opts.db = db
    o.sq = jm.sequence({db: db})

    o.userWechat = UserWechat(o, opts)
  }

  if (!db) {
    db = jm.db.connect().then(cb)
  } else if (typeof db === 'string') {
    db = jm.db.connect(db).then(cb)
  }

  return o
}
