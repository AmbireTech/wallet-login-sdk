import { AmbireLoginSDK, AmbireLogoSVG } from '@ambire/login-sdk-core';
import { createEIP1193Provider } from '@web3-onboard/common';

function AmbireWalletModule(sdkParams) {
  var ambireSDK = new AmbireLoginSDK(sdkParams);
  var connectedAccounts = [];
  var connectedchain;
  var handleLogin = function handleLogin(chainId) {
    if (chainId === void 0) {
      chainId = null;
    }
    try {
      var _chainId;
      chainId = (_chainId = chainId) !== null && _chainId !== void 0 ? _chainId : connectedchain;
      ambireSDK.openLogin({
        chainId: parseInt(chainId)
      });
      return Promise.resolve(new Promise((resolve, reject) => {
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
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  var handleSignMessage = function handleSignMessage(signType, message) {
    try {
      ambireSDK.openSignMessage(signType, message);
      return Promise.resolve(new Promise((resolve, reject) => {
        ambireSDK.onMsgSigned(data => {
          return resolve(data.signature);
        });
        ambireSDK.onMsgRejected(() => {
          reject({
            code: 4001,
            message: 'User rejected the request.'
          });
        });
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  var handleSignTransaction = function handleSignTransaction(transactionObject) {
    try {
      var txTo = transactionObject.to.toString();
      var txValue = transactionObject.value ? transactionObject.value.toString() : '0x';
      var txData = transactionObject.data ? transactionObject.data.toString() : '0x';
      ambireSDK.openSendTransaction(txTo, txValue, txData);
      return Promise.resolve(new Promise((resolve, reject) => {
        ambireSDK.onTxnSent(data => {
          return resolve(data.hash);
        });
        ambireSDK.onTxnRejected(() => {
          reject({
            code: 4001,
            message: 'User rejected the request.'
          });
        });
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  return () => {
    return {
      label: 'Ambire Wallet',
      getIcon: function () {
        try {
          return Promise.resolve(AmbireLogoSVG.default);
        } catch (e) {
          return Promise.reject(e);
        }
      },
      getInterface: function (_ref) {
        var {
          EventEmitter
        } = _ref;
        try {
          var emitter = new EventEmitter();
          var requestPatch = {
            eth_requestAccounts: function () {
              try {
                if (connectedAccounts.length > 0) {
                  return Promise.resolve(connectedAccounts);
                }
                return handleLogin();
              } catch (e) {
                return Promise.reject(e);
              }
            },
            eth_selectAccounts: function () {
              try {
                if (connectedAccounts.length > 0) {
                  return Promise.resolve(connectedAccounts);
                }
                return handleLogin();
              } catch (e) {
                return Promise.reject(e);
              }
            },
            eth_accounts: function () {
              try {
                return Promise.resolve(connectedAccounts);
              } catch (e) {
                return Promise.reject(e);
              }
            },
            eth_chainId: function () {
              try {
                return Promise.resolve(connectedchain);
              } catch (e) {
                return Promise.reject(e);
              }
            },
            // @ts-ignore
            personal_sign: function (_ref2) {
              var {
                params: [message, address]
              } = _ref2;
              return handleSignMessage('personal_sign', message);
            },
            // @ts-ignore
            eth_sign: function (_ref3) {
              var {
                params: [address, message]
              } = _ref3;
              return handleSignMessage('eth_sign', message);
            },
            // @ts-ignore
            eth_signTypedData: function (_ref4) {
              var {
                params: [address, typedData]
              } = _ref4;
              return handleSignMessage('eth_signTypedData', typedData);
            },
            // @ts-ignore
            eth_signTypedData_v4: function (_ref5) {
              var {
                params: [address, typedData]
              } = _ref5;
              return handleSignMessage('eth_signTypedData_v4', typedData);
            },
            // @ts-ignore
            eth_sendTransaction: function (_ref6) {
              var {
                params: [transactionObject]
              } = _ref6;
              try {
                var txTo = transactionObject.to.toString();
                var txValue = transactionObject.value.toString();
                var txData = transactionObject.data ? transactionObject.data.toString() : '0x';
                ambireSDK.openSendTransaction(txTo, txValue, txData);
                return Promise.resolve(new Promise((resolve, reject) => {
                  ambireSDK.onTxnSent(data => {
                    return resolve(data.hash);
                  });
                  ambireSDK.onTxnRejected(() => {
                    reject({
                      code: 4001,
                      message: 'User rejected the request.'
                    });
                  });
                }));
              } catch (e) {
                return Promise.reject(e);
              }
            },
            // @ts-ignore
            eth_sendTransaction: function (_ref7) {
              var {
                params: [transactionObject]
              } = _ref7;
              return handleSignTransaction(transactionObject);
            },
            // @ts-ignore
            eth_signTransaction: function (_ref8) {
              var {
                params: [transactionObject]
              } = _ref8;
              return handleSignTransaction(transactionObject);
            },
            // @ts-ignore
            wallet_switchEthereumChain: function (_ref9) {
              var {
                params: [chainObject]
              } = _ref9;
              try {
                return handleLogin(chainObject.chainId);
              } catch (e) {
                return Promise.reject(e);
              }
            }
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
          return Promise.resolve({
            provider
          });
        } catch (e) {
          return Promise.reject(e);
        }
      },
      platforms: ['all']
    };
  };
}

export { AmbireWalletModule };
//# sourceMappingURL=login-sdk-web3-onboard.esm.js.map
