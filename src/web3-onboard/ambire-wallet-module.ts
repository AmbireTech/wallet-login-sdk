import { sdkParamsType } from '../types'
import AMBIRE_ICON from 'assets/ambire.png'
import { createEIP1193Provider, WalletInit } from '@web3-onboard/common'

export function AmbireWalletModule(sdkParams: sdkParamsType): WalletInit {
    const ambireSDK = new window.AmbireSDK(sdkParams)

    let connectedAccounts: string[] = []
    let connectedchain: string = '0x1'

    const handleLogin = async () => {
        ambireSDK.openLogin({chainId: parseInt(connectedchain)})

        return new Promise((resolve, reject) => {
            ambireSDK.onLoginSuccess((data: any) => {
                connectedAccounts = [data.address]
                connectedchain = `0x${parseInt(data.chainId).toString(16)}`
                resolve(connectedAccounts)
            })

            ambireSDK.onAlreadyLoggedIn((data: any) => {
                connectedAccounts = [data.address]
                connectedchain = `0x${parseInt(data.chainId).toString(16)}`
                resolve(connectedAccounts)
            })

            ambireSDK.onRegistrationSuccess((data: any) => {
                connectedAccounts = [data.address]
                connectedchain = `0x${parseInt(data.chainId).toString(16)}`
                resolve(connectedAccounts)
            })

            ambireSDK.onActionRejected((data: any) => {
                connectedAccounts = [data.address]
                reject({ code: 4001, message: 'User rejected the request.' })
            })
        })
    }

    const handleSignMessage = async (signType: string, message: string) => {
        ambireSDK.openSignMessage(signType, message)

        return new Promise((resolve, reject) => {
            ambireSDK.onMsgSigned((data: any) => {
                return resolve(data.signature)
            })

            ambireSDK.onMsgRejected(() => {
                reject({ code: 4001, message: 'User rejected the request.' })
            })
        })
    }

    return () => {
        return {
            label: 'Ambire Wallet',
            getIcon: async () => AMBIRE_ICON,
            getInterface: async ({ EventEmitter }) => {
                const emitter = new EventEmitter()

                const requestPatch: any = {
                    eth_requestAccounts: async () => {
                        if (connectedAccounts.length > 0) {
                            return Promise.resolve(connectedAccounts)
                        }

                        return handleLogin()
                    },
                    eth_selectAccounts: async () => {
                        if (connectedAccounts.length > 0) {
                            return Promise.resolve(connectedAccounts)
                        }

                        return handleLogin()
                    },
                    eth_accounts: async () => {
                        return Promise.resolve(connectedAccounts)
                    },
                    eth_chainId: async () => {
                        return Promise.resolve(connectedchain)
                    },
                    // @ts-ignore
                    personal_sign: async ({ params: [message, address] }) => {
                        return handleSignMessage('personal_sign', message)
                    },
                    // @ts-ignore
                    eth_sign: async ({ params: [address, message] }) => {
                        return handleSignMessage('eth_sign', message)
                    },
                    // @ts-ignore
                    eth_signTypedData: async ({ params: [address, typedData] }) => {
                        return handleSignMessage('eth_signTypedData', typedData)
                    },
                    // @ts-ignore
                    eth_signTypedData_v4: async ({ params: [address, typedData] }) => {
                        return handleSignMessage('eth_signTypedData_v4', typedData)
                    },
                    // @ts-ignore
                    eth_sendTransaction: async ({ params: [transactionObject] }) => {
                        const txTo: string = transactionObject.to.toString()
                        const txValue: string = transactionObject.value.toString()
                        const txData: string = transactionObject.data ? transactionObject.data.toString() : '0x'

                        ambireSDK.openSendTransaction(txTo, txValue, txData)

                        return new Promise((resolve, reject) => {
                            ambireSDK.onTxnSent((data: any) => {
                                return resolve(data.hash)
                            })

                            ambireSDK.onTxnRejected(() => {
                                reject({ code: 4001, message: 'User rejected the request.' })
                            })
                        })
                    },
                }

                const provider = createEIP1193Provider({
                    on: emitter.on.bind(emitter),
                }, requestPatch)

                return {
                    provider
                }
            },
            platforms: ['all']
        }
    }
}
