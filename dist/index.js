
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./ambire-login-sdk.cjs.production.min.js')
} else {
  module.exports = require('./ambire-login-sdk.cjs.development.js')
}
