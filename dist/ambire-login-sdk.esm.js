import { Connector } from '@web3-react/types';
import { JsonRpcProvider } from '@ethersproject/providers';
import AMBIRE_ICON from 'assets/ambire.png';
import { createEIP1193Provider } from '@web3-onboard/common';

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

class AmbireWallet extends Connector {
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
class AmbireProvider extends JsonRpcProvider {
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

function AmbireWalletModule(sdkParams) {
  var ambireSDK = new window.AmbireSDK(sdkParams);
  var connectedAccounts = [];
  var connectedchain = '0x1';
  var handleLogin = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator(function* () {
      ambireSDK.openLogin({
        chainId: parseInt(connectedchain)
      });
      return new Promise((resolve, reject) => {
        ambireSDK.onLoginSuccess(data => {
          connectedAccounts = [data.address];
          connectedchain = "0x" + parseInt(data.chainId).toString(16);
          resolve(connectedAccounts);
        });
        ambireSDK.onAlreadyLoggedIn(data => {
          connectedAccounts = [data.address];
          connectedchain = "0x" + parseInt(data.chainId).toString(16);
          resolve(connectedAccounts);
        });
        ambireSDK.onRegistrationSuccess(data => {
          connectedAccounts = [data.address];
          connectedchain = "0x" + parseInt(data.chainId).toString(16);
          resolve(connectedAccounts);
        });
        ambireSDK.onActionRejected(data => {
          connectedAccounts = [data.address];
          reject({
            code: 4001,
            message: 'User rejected the request.'
          });
        });
      });
    });
    return function handleLogin() {
      return _ref.apply(this, arguments);
    };
  }();
  var handleSignMessage = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(function* (signType, message) {
      ambireSDK.openSignMessage(signType, message);
      return new Promise((resolve, reject) => {
        ambireSDK.onMsgSigned(data => {
          return resolve(data.signature);
        });
        ambireSDK.onMsgRejected(() => {
          reject({
            code: 4001,
            message: 'User rejected the request.'
          });
        });
      });
    });
    return function handleSignMessage(_x, _x2) {
      return _ref2.apply(this, arguments);
    };
  }();
  return () => {
    return {
      label: 'Ambire Wallet',
      getIcon: function () {
        var _getIcon = _asyncToGenerator(function* () {
          return AMBIRE_ICON;
        });
        function getIcon() {
          return _getIcon.apply(this, arguments);
        }
        return getIcon;
      }(),
      getInterface: function () {
        var _getInterface = _asyncToGenerator(function* (_ref3) {
          var {
            EventEmitter
          } = _ref3;
          var emitter = new EventEmitter();
          var requestPatch = {
            eth_requestAccounts: function () {
              var _eth_requestAccounts = _asyncToGenerator(function* () {
                if (connectedAccounts.length > 0) {
                  return Promise.resolve(connectedAccounts);
                }
                return handleLogin();
              });
              function eth_requestAccounts() {
                return _eth_requestAccounts.apply(this, arguments);
              }
              return eth_requestAccounts;
            }(),
            eth_selectAccounts: function () {
              var _eth_selectAccounts = _asyncToGenerator(function* () {
                if (connectedAccounts.length > 0) {
                  return Promise.resolve(connectedAccounts);
                }
                return handleLogin();
              });
              function eth_selectAccounts() {
                return _eth_selectAccounts.apply(this, arguments);
              }
              return eth_selectAccounts;
            }(),
            eth_accounts: function () {
              var _eth_accounts = _asyncToGenerator(function* () {
                return Promise.resolve(connectedAccounts);
              });
              function eth_accounts() {
                return _eth_accounts.apply(this, arguments);
              }
              return eth_accounts;
            }(),
            eth_chainId: function () {
              var _eth_chainId = _asyncToGenerator(function* () {
                return Promise.resolve(connectedchain);
              });
              function eth_chainId() {
                return _eth_chainId.apply(this, arguments);
              }
              return eth_chainId;
            }(),
            // @ts-ignore
            personal_sign: function () {
              var _personal_sign = _asyncToGenerator(function* (_ref4) {
                var {
                  params: [message, address]
                } = _ref4;
                return handleSignMessage('personal_sign', message);
              });
              function personal_sign(_x4) {
                return _personal_sign.apply(this, arguments);
              }
              return personal_sign;
            }(),
            // @ts-ignore
            eth_sign: function () {
              var _eth_sign = _asyncToGenerator(function* (_ref5) {
                var {
                  params: [address, message]
                } = _ref5;
                return handleSignMessage('eth_sign', message);
              });
              function eth_sign(_x5) {
                return _eth_sign.apply(this, arguments);
              }
              return eth_sign;
            }(),
            // @ts-ignore
            eth_signTypedData: function () {
              var _eth_signTypedData = _asyncToGenerator(function* (_ref6) {
                var {
                  params: [address, typedData]
                } = _ref6;
                return handleSignMessage('eth_signTypedData', typedData);
              });
              function eth_signTypedData(_x6) {
                return _eth_signTypedData.apply(this, arguments);
              }
              return eth_signTypedData;
            }(),
            // @ts-ignore
            eth_signTypedData_v4: function () {
              var _eth_signTypedData_v = _asyncToGenerator(function* (_ref7) {
                var {
                  params: [address, typedData]
                } = _ref7;
                return handleSignMessage('eth_signTypedData_v4', typedData);
              });
              function eth_signTypedData_v4(_x7) {
                return _eth_signTypedData_v.apply(this, arguments);
              }
              return eth_signTypedData_v4;
            }(),
            // @ts-ignore
            eth_sendTransaction: function () {
              var _eth_sendTransaction = _asyncToGenerator(function* (_ref8) {
                var {
                  params: [transactionObject]
                } = _ref8;
                var txTo = transactionObject.to.toString();
                var txValue = transactionObject.value.toString();
                var txData = transactionObject.data ? transactionObject.data.toString() : '0x';
                ambireSDK.openSendTransaction(txTo, txValue, txData);
                return new Promise((resolve, reject) => {
                  ambireSDK.onTxnSent(data => {
                    return resolve(data.hash);
                  });
                  ambireSDK.onTxnRejected(() => {
                    reject({
                      code: 4001,
                      message: 'User rejected the request.'
                    });
                  });
                });
              });
              function eth_sendTransaction(_x8) {
                return _eth_sendTransaction.apply(this, arguments);
              }
              return eth_sendTransaction;
            }()
          };
          var provider = createEIP1193Provider({
            on: emitter.on.bind(emitter)
          }, requestPatch);
          return {
            provider
          };
        });
        function getInterface(_x3) {
          return _getInterface.apply(this, arguments);
        }
        return getInterface;
      }(),
      platforms: ['all']
    };
  };
}

export { AmbireWallet, AmbireWalletModule as Web3OnboardAmbireWalletModule };
//# sourceMappingURL=ambire-login-sdk.esm.js.map
