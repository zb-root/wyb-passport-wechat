require('log4js').configure(require('path').join(__dirname, 'log4js.json'))
let config = {
  development: {
    debug: true,
    lng: 'zh_CN',
    port: 3000,
    domain: 'www.wyb.jamma.cn',
    appid: 'wx7c7aa23a249cf275',
    appsecret: '438984dc3501b8f6f79afe5ceeed8d06',
    db: 'mongodb://root:123@api.h5.jamma.cn/wyb?authSource=admin',
    gateway: 'http://api.wyb.jamma.cn:81',
    modules: {
      'passport': {
        module: process.cwd() + '/lib'
      }
    }
  },
  production: {
    lng: 'zh_CN',
    port: 80,
    domain: 'www.wyb.jamma.cn',
    appid: 'wx7c7aa23a249cf275',
    appsecret: '438984dc3501b8f6f79afe5ceeed8d06',
    gateway: 'http://gateway.app',
    modules: {
      'passport': {
        module: process.cwd() + '/lib'
      }
    }
  }
}

let env = process.env.NODE_ENV || 'development'
config = config[env] || config['development']
config.env = env

module.exports = config
