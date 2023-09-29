import { AmbireLoginSDK, AmbireLogoSVG } from '@ambire/login-sdk-core';
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

function AmbireWalletModule(sdkParams) {
  var ambireSDK = new AmbireLoginSDK(sdkParams);
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
  var handleSignTransaction = /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator(function* (transactionObject) {
      var txTo = transactionObject.to.toString();
      var txValue = transactionObject.value ? transactionObject.value.toString() : '0x';
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
    return function handleSignTransaction(_x3) {
      return _ref3.apply(this, arguments);
    };
  }();
  return () => {
    return {
      label: 'Ambire Wallet',
      getIcon: function () {
        var _getIcon = _asyncToGenerator(function* () {
          return AmbireLogoSVG.default;
        });
        function getIcon() {
          return _getIcon.apply(this, arguments);
        }
        return getIcon;
      }(),
      getInterface: function () {
        var _getInterface = _asyncToGenerator(function* (_ref4) {
          var {
            EventEmitter
          } = _ref4;
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
              var _personal_sign = _asyncToGenerator(function* (_ref5) {
                var {
                  params: [message, address]
                } = _ref5;
                return handleSignMessage('personal_sign', message);
              });
              function personal_sign(_x5) {
                return _personal_sign.apply(this, arguments);
              }
              return personal_sign;
            }(),
            // @ts-ignore
            eth_sign: function () {
              var _eth_sign = _asyncToGenerator(function* (_ref6) {
                var {
                  params: [address, message]
                } = _ref6;
                return handleSignMessage('eth_sign', message);
              });
              function eth_sign(_x6) {
                return _eth_sign.apply(this, arguments);
              }
              return eth_sign;
            }(),
            // @ts-ignore
            eth_signTypedData: function () {
              var _eth_signTypedData = _asyncToGenerator(function* (_ref7) {
                var {
                  params: [address, typedData]
                } = _ref7;
                return handleSignMessage('eth_signTypedData', typedData);
              });
              function eth_signTypedData(_x7) {
                return _eth_signTypedData.apply(this, arguments);
              }
              return eth_signTypedData;
            }(),
            // @ts-ignore
            eth_signTypedData_v4: function () {
              var _eth_signTypedData_v = _asyncToGenerator(function* (_ref8) {
                var {
                  params: [address, typedData]
                } = _ref8;
                return handleSignMessage('eth_signTypedData_v4', typedData);
              });
              function eth_signTypedData_v4(_x8) {
                return _eth_signTypedData_v.apply(this, arguments);
              }
              return eth_signTypedData_v4;
            }(),
            // @ts-ignore
            eth_sendTransaction: function () {
              var _eth_sendTransaction = _asyncToGenerator(function* (_ref9) {
                var {
                  params: [transactionObject]
                } = _ref9;
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
              function eth_sendTransaction(_x9) {
                return _eth_sendTransaction.apply(this, arguments);
              }
              return eth_sendTransaction;
            }(),
            // @ts-ignore
            eth_sendTransaction: function () {
              var _eth_sendTransaction2 = _asyncToGenerator(function* (_ref10) {
                var {
                  params: [transactionObject]
                } = _ref10;
                return handleSignTransaction(transactionObject);
              });
              function eth_sendTransaction(_x10) {
                return _eth_sendTransaction2.apply(this, arguments);
              }
              return eth_sendTransaction;
            }(),
            // @ts-ignore
            eth_signTransaction: function () {
              var _eth_signTransaction = _asyncToGenerator(function* (_ref11) {
                var {
                  params: [transactionObject]
                } = _ref11;
                return handleSignTransaction(transactionObject);
              });
              function eth_signTransaction(_x11) {
                return _eth_signTransaction.apply(this, arguments);
              }
              return eth_signTransaction;
            }()
          };
          var provider = createEIP1193Provider({
            on: emitter.on.bind(emitter),
            disconnect: () => {
              ambireSDK.openLogout();
              ambireSDK.onLogoutSuccess(() => {
                connectedAccounts = [];
              });
            }
          }, requestPatch);
          return {
            provider
          };
        });
        function getInterface(_x4) {
          return _getInterface.apply(this, arguments);
        }
        return getInterface;
      }(),
      platforms: ['all']
    };
  };
}

export { AmbireWalletModule };
//# sourceMappingURL=login-sdk-web3-onboard.esm.js.map
