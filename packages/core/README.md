# @ambire/login-sdk-core

SDK for integrating Ambire Wallet Login to DApps.

# Install

```console
npm install @ambire/login-sdk-core
```

## Usage

```typescript
import { AmbireLoginSDK } from '@ambire/login-sdk-core'

const ambireLoginSDK = new AmbireLoginSDK({
    dappName: 'Your DApp name',
    dappIconPath: '<url-to-DApp-icon>',       // optional, but needed for DApp icon to be shown in Ambire Login modal
})

// open modal for login / create account
ambireLoginSDK.openLogin()

// trigger logout
ambireLoginSDK.openLogout()

// open modal for sending a transaction
ambireLoginSDK.openSendTransaction(to, value, data)

// open modal for signing a message
// supported types: eth_sign, personal_sign, eth_signTypedData, eth_signTypedData_v4
ambireLoginSDK.openSignMessage(type, message)

// add DApp-specific logic by
// subscribing to SDK listeners
ambireLoginSDK.onLoginSuccess((data) => {
    // data: {
    //  address: string   
    //  chainId: number
    //  providerUrl: string
    // }

    // DApp logic
})
ambireLoginSDK.onRegistrationSuccess((data) => {
    // data: {
    //  address: string   
    //  chainId: number
    //  providerUrl: string
    // }

    // DApp logic
})
ambireLoginSDK.onAlreadyLoggedIn((data) => {
    // data: {
    //  address: string   
    //  chainId: number
    //  providerUrl: string
    // }

    // DApp logic
})
ambireLoginSDK.onLogoutSuccess(() => {
    // DApp logic
})
ambireLoginSDK.onTxnSent((data) => {
    // data: {
    //  hash: string
    // }

    // DApp logic
})
ambireLoginSDK.onTxnRejected(() => {
    // DApp logic
})
ambireLoginSDK.onMsgSigned((data) => {
    // data: {
    //  signature: string
    // }

    // DApp logic
})
ambireLoginSDK.onMsgRejected((data) => {
    // DApp logic
})
ambireLoginSDK.onActionRejected((data) => {
    // DApp logic
})
```
