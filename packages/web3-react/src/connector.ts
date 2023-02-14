import { AmbireLoginSDK } from '@cmihaylov/core'
import { Actions, Connector } from '@web3-react/types'
import { AmbireProvider } from './provider'

export class AmbireConnector extends Connector {
    _sdk: any

    constructor(actions: Actions, options: any, onError?: (error: Error) => void) {
        super(actions, onError)
        this._sdk = new AmbireLoginSDK(options)
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
