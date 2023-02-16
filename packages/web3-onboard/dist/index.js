
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./login-sdk-web3-onboard.cjs.production.min.js')
} else {
  module.exports = require('./login-sdk-web3-onboard.cjs.development.js')
}
