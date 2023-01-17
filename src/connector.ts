import { Actions, Connector } from '@web3-react/types'
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers'
import { ConnectionInfo } from "@ethersproject/web";
import { Networkish } from '@ethersproject/networks'

export class AmbireWallet extends Connector {
  _sdk: any

  constructor(actions: Actions, options: any, onError?: (error: Error) => void) {
    super(actions, onError)
    this._sdk = new window.AmbireSDK(options)
  }

  activate(chainInfo: any): Promise<void> | void {
    this.actions.startActivation()
    this._sdk.openLogin(chainInfo)

    return new Promise((resolve, reject) => {
      this._sdk.onAlreadyLoggedIn((data: any) => {
        const activeChainId = chainInfo ? parseInt(chainInfo.chainId) : parseInt(data.chainId)
        this.customProvider = this.getProvider(data.address, data.providerUrl)
        this.actions.update({ chainId: activeChainId, accounts: [data.address] })
        resolve()
      })
      this._sdk.onLoginSuccess((data: any) => {
        const activeChainId = chainInfo ? parseInt(chainInfo.chainId) : parseInt(data.chainId)
        this.customProvider = this.getProvider(data.address, data.providerUrl)
        this.actions.update({ chainId: activeChainId, accounts: [data.address] })
        resolve()
      })
      this._sdk.onRegistrationSuccess((data: any) => {
        const activeChainId = chainInfo ? chainInfo.chainId : data.chainId
        this.customProvider = this.getProvider(data.address, data.providerUrl)
        this.actions.update({ chainId: activeChainId, accounts: [data.address] })
        resolve()
      })
      this._sdk.onActionRejected((data: any) => {
        const activeChainId = parseInt(data.chainId)
        this.customProvider = this.getProvider(data.address, data.providerUrl)
        this.actions.update({ chainId: activeChainId, accounts: [data.address] })
        reject({ code: 4001, message: 'User rejected the request.' })
      })
    })
  }

  deactivate(): Promise<void> | void {
    this._sdk.openLogout()

    return new Promise((resolve) => {
      this._sdk.onLogoutSuccess(() => {
        this.customProvider = null
        this.actions.resetState()
        resolve()
      })
    })
  }

  getProvider(address: string, providerUrl: string): AmbireProvider {
    return new AmbireProvider(this._sdk, address, providerUrl)
  }
}

class AmbireProvider extends JsonRpcProvider {
  _address: string
  _sdk: any

  constructor(sdk: any, address: string, url?: ConnectionInfo | string, network?: Networkish) {
    super(url, network)
    this._address = address
    this._sdk = sdk
  }

  getSigner(addressOrIndex?: string | number): JsonRpcSigner {
    const signerAddress = addressOrIndex ? addressOrIndex : this._address
    const signer = super.getSigner(signerAddress)
    const provider = this

    const handler1 = {
      get(target: any, prop: any, receiver: any) {
        if (prop === 'sendTransaction') {
          const value = target[prop]
          if (value instanceof Function) {
            return function (...args: any) {
              const txn = args.data ? args : args[0]
              const txnValue = txn.value ? txn.value.toString() : '0'

              provider._sdk.openSendTransaction(txn.to, txnValue, txn.data)

              return new Promise((resolve, reject) => {
                provider._sdk.onTxnSent(async (data: any) => {
                  const hash = data.hash
                  const tx = await provider.getTransaction(hash)
                  const response = provider._wrapTransaction(tx, hash)
                  response.data = txn.data
                  return resolve(response)
                })
                provider._sdk.onTxnRejected(() => {
                  reject({ code: 4001 })
                })
              })
            }
          }
        }

        if (prop === 'connectUnchecked') {
          const value = target[prop]
          if (value instanceof Function) {
            return function () {
              return new Proxy(signer, handler1)
            }
          }
        }

        if (prop === 'signMessage' || prop === '_legacySignMessage' || prop === '_signTypedData') {
          const value = target[prop]
          if (value instanceof Function) {
            return function (...args: any) {
              const type =
                prop === 'signMessage'
                  ? 'personal_sign'
                  : prop === '_legacySignMessage'
                  ? 'eth_sign'
                  : 'eth_signTypedData_v4'
              return provider.handleMsgSign(type, args)
            }
          }
        }

        return Reflect.get(target, prop, receiver)
      },
    }

    return new Proxy(signer, handler1)
  }

  handleMsgSign(type: string, args: any) {
    const message = args.length === 1 ? args[0] : args
    this._sdk.openSignMessage(type, message)

    return new Promise((resolve, reject) => {
      this._sdk.msgSigned(() => {
        return resolve(args[0])
      })
      this._sdk.onMsgRejected(() => {
        reject({ code: 4001 })
      })
    })
  }
}