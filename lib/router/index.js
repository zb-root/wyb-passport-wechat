let _ = require('lodash')
let async = require('async')
let error = require('jm-err')
let Err = error.Err

module.exports = function (router) {
  let service = this

  let __signon = function (id, openid, req, res) {
    service.sso.post('/signon', {id: id}, function (err, doc) {
      if (err) return res.json(doc)

      let type = req.query.type || req.body.type
      if (type === 'web') {
        let redirect_uri = req.query.redirect_uri || req.body.redirect_uri || '/'
        let param = 'id=' + doc.id + '&token=' + doc.token + '&openid=' + openid + '&redirect_uri=' + encodeURIComponent(redirect_uri)
        let uri = 'http://' + service.config.domain + '/wechat_oauth.html?' + param
        res.redirect(uri)
      } else {
        doc.openid = openid
        doc.userId = doc.id
        res.json(doc)
      }
    })
  }

  router.post('/login', function (req, res) {
    let data = {}
    _.defaults(data, req.body, req.query)
    let openid = data.openid
    let code = data.code
    async.waterfall([
      function (cb) {
        if (openid) {
          service.oauth.getUser({openid: openid, lang: 'zh_CN'}, function (err, result) {
            if (err) {
              return cb(Err.FAIL)
            }
            cb(null, {type: 0, data: result})
          })
        } else {
          service.oauth.getAccessToken(code, function (err, result) {
            if (err) {
              return cb(Err.FAIL)
            }
            cb(null, {type: 1, data: result.data})
          })
        }
      },
      function (obj, cb) {
        let openid = obj.data.openid
        let unionid = obj.data.unionid
        service.userWechat.findOne({mp_unionid: unionid}, function (err, doc) {
          if (err) return cb(err)
          if (doc) {
            __signon(doc._id.toString(), openid, req, res)
            return cb()
          }
          service.oauth.getUser({openid: openid, lang: 'zh_CN'}, function (err, result) {
            if (err) {
              return cb(err)
            }
            let gender = {'1': '男', '2': '女'}
            let o = {
              mp_unionid: unionid,
              password: unionid + 'oauth',
              nickname: result.nickname,
              sex: gender[result.sex],
              country: result.country,
              province: result.province,
              city: result.city,
              headimgurl: result.headimgurl
            }
            console.log(JSON.stringify(result))
            console.log(JSON.stringify(o))
            async.waterfall([
              function (cb) {
                let data = {
                  nick: o.nickname,
                  password: o.password,
                  gender: o.sex,
                  country: o.country,
                  province: o.province
                }

                service.user.post('/signup', data)
                  .then(function (doc) {
                    if (doc.err) return res.json(doc)
                    return doc
                  })
                  .then(function (doc) {
                    if (doc.err) return cb(doc)
                    o._id = doc._id
                    cb()
                  })
                  .catch(function (err) {
                    let doc = Err.FAIL
                    err.code && (doc.err = err.code)
                    err.message && (doc.msg = err.message)
                    cb(doc)
                  })
              },
              function (cb) {
                service.userWechat.create(o, function (err, doc) {
                  if (err) return cb(Err.FAIL)
                  cb()
                })
              }
            ], function (err, result) {
              if (err) return cb(err)
              __signon(o._id, openid, req, res)
            })
          })
        })
      }
    ], function (err, result) {
      if (err) return res.send(err)
    })
  })
}
