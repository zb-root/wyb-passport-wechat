let passport = require('passport')

module.exports = function (opts) {
  ['lng', 'port', 'domain', 'db', 'gateway', 'appid', 'appsecret'].forEach(function (key) {
    process.env[key] && (opts[key] = process.env[key])
  })

  let service = require('./service')(opts)

  let self = this
  this.on('open', function () {
    let middle = self.servers.http.middle
    middle.use(passport.initialize())
    require('./router').call(service, middle)
  })

  return service
}
