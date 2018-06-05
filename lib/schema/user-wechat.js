let mongoose = require('mongoose')
let Schema = mongoose.Schema

let schemaDefine = {
  _id: {type: Schema.Types.ObjectId, ref: 'user'},
  mp_unionid: {type: String, unique: true, sparse: true, index: true}, // 微信公众号unionid
  nickname: {type: String},
  sex: {type: String},
  country: {type: String},
  province: {type: String},
  city: {type: String},
  headimgurl: {type: String}
}

module.exports = function (schema, opts) {
  schema = schema || new Schema()
  schema.add(schemaDefine)
  return schema
}
