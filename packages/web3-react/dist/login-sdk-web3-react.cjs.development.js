'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var providers = require('@ethersproject/providers');
var loginSdkCore = require('@ambire/login-sdk-core');
var types = require('@web3-react/types');

// A type of promise-like that resolves synchronously and supports only one observer
var _Pact = /*#__PURE__*/function () {
  function _Pact() {}
  _Pact.prototype.then = function (onFulfilled, onRejected) {
    var result = new _Pact();
    var state = this.s;
    if (state) {
      var callback = state & 1 ? onFulfilled : onRejected;
      if (callback) {
        try {
          _settle(result, 1, callback(this.v));
        } catch (e) {
          _settle(result, 2, e);
        }
        return result;
      } else {
        return this;
      }
    }
    this.o = function (_this) {
      try {
        var value = _this.v;
        if (_this.s & 1) {
          _settle(result, 1, onFulfilled ? onFulfilled(value) : value);
        } else if (onRejected) {
          _settle(result, 1, onRejected(value));
        } else {
          _settle(result, 2, value);
        }
      } catch (e) {
        _settle(result, 2, e);
      }
    };
    return result;
  };
  return _Pact;
}();

// Settles a pact synchronously
function _settle(pact, state, value) {
  if (!pact.s) {
    if (value instanceof _Pact) {
      if (value.s) {
        if (state & 1) {
          state = value.s;
        }
        value = value.v;
      } else {
        value.o = _settle.bind(null, pact, state);
        return;
      }
    }
    if (value && value.then) {
      value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
      return;
    }
    pact.s = state;
    pact.v = value;
    var observer = pact.o;
    if (observer) {
      observer(pact);
    }
  }
}
function _isSettledPact(thenable) {
  return thenable instanceof _Pact && thenable.s & 1;
}
var _iteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.iterator || (Symbol.iterator = /*#__PURE__*/Symbol("Symbol.iterator")) : "@@iterator";
var _asyncIteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.asyncIterator || (Symbol.asyncIterator = /*#__PURE__*/Symbol("Symbol.asyncIterator")) : "@@asyncIterator";

// Asynchronously implement a generic for loop
function _for(test, update, body) {
  var stage;
  for (;;) {
    var shouldContinue = test();
    if (_isSettledPact(shouldContinue)) {
      shouldContinue = shouldContinue.v;
    }
    if (!shouldContinue) {
      return result;
    }
    if (shouldContinue.then) {
      stage = 0;
      break;
    }
    var result = body();
    if (result && result.then) {
      if (_isSettledPact(result)) {
        result = result.s;
      } else {
        stage = 1;
        break;
      }
    }
    if (update) {
      var updateValue = update();
      if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
        stage = 2;
        break;
      }
    }
  }
  var pact = new _Pact();
  var reject = _settle.bind(null, pact, 2);
  (stage === 0 ? shouldContinue.then(_resumeAfterTest) : stage === 1 ? result.then(_resumeAfterBody) : updateValue.then(_resumeAfterUpdate)).then(void 0, reject);
  return pact;
  function _resumeAfterBody(value) {
    result = value;
    do {
      if (update) {
        updateValue = update();
        if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
          updateValue.then(_resumeAfterUpdate).then(void 0, reject);
          return;
        }
      }
      shouldContinue = test();
      if (!shouldContinue || _isSettledPact(shouldContinue) && !shouldContinue.v) {
        _settle(pact, 1, result);
        return;
      }
      if (shouldContinue.then) {
        shouldContinue.then(_resumeAfterTest).then(void 0, reject);
        return;
      }
      result = body();
      if (_isSettledPact(result)) {
        result = result.v;
      }
    } while (!result || !result.then);
    result.then(_resumeAfterBody).then(void 0, reject);
  }
  function _resumeAfterTest(shouldContinue) {
    if (shouldContinue) {
      result = body();
      if (result && result.then) {
        result.then(_resumeAfterBody).then(void 0, reject);
      } else {
        _resumeAfterBody(result);
      }
    } else {
      _settle(pact, 1, result);
    }
  }
  function _resumeAfterUpdate() {
    if (shouldContinue = test()) {
      if (shouldContinue.then) {
        shouldContinue.then(_resumeAfterTest).then(void 0, reject);
      } else {
        _resumeAfterTest(shouldContinue);
      }
    } else {
      _settle(pact, 1, result);
    }
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
              var txnValue = txn.value ? txn.value.toString() : '0';
              provider._sdk.openSendTransaction(txn.to, txnValue, txn.data);
              return new Promise((resolve, reject) => {
                provider._sdk.onTxnSent(function (data) {
                  try {
                    function _temp3() {
                      var response = provider._wrapTransaction(fetchedTx, hash);
                      response.data = txn.data;
                      return resolve(response);
                    }
                    var hash = data.hash;
                    // if the txn is submitted, try to fetch it until success
                    var fetchedTx = null;
                    var failed = 0;
                    var _temp2 = _for(function () {
                      return fetchedTx === null && failed < 5;
                    }, void 0, function () {
                      return Promise.resolve(provider.getTransaction(hash)).then(function (_provider$getTransact) {
                        fetchedTx = _provider$getTransact;
                        var _temp = function () {
                          if (fetchedTx === null) {
                            return Promise.resolve(new Promise(r => setTimeout(r, 1500))).then(function () {
                              failed++;
                            });
                          }
                        }();
                        if (_temp && _temp.then) return _temp.then(function () {});
                      });
                    });
                    return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(_temp3) : _temp3(_temp2));
                  } catch (e) {
                    return Promise.reject(e);
                  }
                });
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

class AmbireConnector extends types.Connector {
  constructor(actions, options, onError) {
    super(actions, onError);
    this._sdk = new loginSdkCore.AmbireLoginSDK(options);
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

exports.AmbireConnector = AmbireConnector;
exports.AmbireProvider = AmbireProvider;
//# sourceMappingURL=login-sdk-web3-react.cjs.development.js.map
