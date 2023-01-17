'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var types = require('@web3-react/types');
var bignumber = require('@ethersproject/bignumber');
var providers = require('@ethersproject/providers');

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}
function _asyncToGenerator(fn) {
  return function () {
    var self = this,
      args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(undefined);
    });
  };
}

class AmbireWallet extends types.Connector {
  constructor(actions, options, onError) {
    super(actions, onError);
    this._sdk = new window.AmbireSDK(options);
  }
  activate(chainInfo) {
    this.actions.startActivation();
    this._sdk.openLogin(chainInfo);
    return new Promise((resolve, reject) => {
      this._sdk.onAlreadyLoggedIn(data => {
        var activeChainId = chainInfo ? parseInt(chainInfo.chainId) : parseInt(data.chainId);
        this.customProvider = this.getProvider(data.address, data.providerUrl);
        this.actions.update({
          chainId: activeChainId,
          accounts: [data.address]
        });
        resolve();
      });
      this._sdk.onLoginSuccess(data => {
        var activeChainId = chainInfo ? parseInt(chainInfo.chainId) : parseInt(data.chainId);
        this.customProvider = this.getProvider(data.address, data.providerUrl);
        this.actions.update({
          chainId: activeChainId,
          accounts: [data.address]
        });
        resolve();
      });
      this._sdk.onRegistrationSuccess(data => {
        var activeChainId = chainInfo ? chainInfo.chainId : data.chainId;
        this.customProvider = this.getProvider(data.address, data.providerUrl);
        this.actions.update({
          chainId: activeChainId,
          accounts: [data.address]
        });
        resolve();
      });
      this._sdk.onActionRejected(data => {
        var activeChainId = parseInt(data.chainId);
        this.customProvider = this.getProvider(data.address, data.providerUrl);
        this.actions.update({
          chainId: activeChainId,
          accounts: [data.address]
        });
        reject({
          code: 4001,
          message: 'User rejected the request.'
        });
      });
    });
  }
  deactivate() {
    this._sdk.openLogout();
    return new Promise(resolve => {
      this._sdk.onLogoutSuccess(() => {
        this.customProvider = null;
        this.actions.resetState();
        resolve();
      });
    });
  }
  getProvider(address, providerUrl) {
    return new AmbireProvider(this._sdk, address, providerUrl);
  }
}
class AmbireProvider extends providers.JsonRpcProvider {
  constructor(sdk, address, url, network) {
    super(url, network);
    this._address = address;
    this._sdk = sdk;
  }
  getSigner(addressOrIndex) {
    var signerAddress = addressOrIndex ? addressOrIndex : this._address;
    var signer = super.getSigner(signerAddress);
    var provider = this;
    var handler1 = {
      get(target, prop, receiver) {
        if (prop === 'sendTransaction') {
          var value = target[prop];
          if (value instanceof Function) {
            return function () {
              for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }
              var txn = args.data ? args : args[0];
              var txnValue = txn.value ? txn.value instanceof bignumber.BigNumber ? txn.value.toString() : txn.value : '0';
              provider._sdk.openSendTransaction(txn.to, txnValue, txn.data);
              return new Promise((resolve, reject) => {
                provider._sdk.onTxnSent( /*#__PURE__*/function () {
                  var _ref = _asyncToGenerator(function* (data) {
                    var hash = data.hash;
                    var tx = yield provider.getTransaction(hash);
                    var response = provider._wrapTransaction(tx, hash);
                    response.data = txn.data;
                    return resolve(response);
                  });
                  return function (_x) {
                    return _ref.apply(this, arguments);
                  };
                }());
                provider._sdk.onTxnRejected(() => {
                  reject({
                    code: 4001
                  });
                });
              });
            };
          }
        }
        if (prop === 'connectUnchecked') {
          var _value = target[prop];
          if (_value instanceof Function) {
            return function () {
              return new Proxy(signer, handler1);
            };
          }
        }
        if (prop === 'signMessage' || prop === '_legacySignMessage' || prop === '_signTypedData') {
          var _value2 = target[prop];
          if (_value2 instanceof Function) {
            return function () {
              var type = prop === 'signMessage' ? 'personal_sign' : prop === '_legacySignMessage' ? 'eth_sign' : 'eth_signTypedData_v4';
              for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
              }
              return provider.handleMsgSign(type, args);
            };
          }
        }
        return Reflect.get(target, prop, receiver);
      }
    };
    return new Proxy(signer, handler1);
  }
  handleMsgSign(type, args) {
    var message = args.length === 1 ? args[0] : args;
    this._sdk.openSignMessage(type, message);
    return new Promise((resolve, reject) => {
      this._sdk.msgSigned(() => {
        return resolve(args[0]);
      });
      this._sdk.onMsgRejected(() => {
        reject({
          code: 4001
        });
      });
    });
  }
}

exports.AmbireWallet = AmbireWallet;
//# sourceMappingURL=ambire-login-sdk.cjs.development.js.map
