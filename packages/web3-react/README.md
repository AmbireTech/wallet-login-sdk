# @ambire/login-sdk-web3-react

A module for integrating Ambire Wallet Login for DApps using web3-react.

# Install

```console
npm install @ambire/login-sdk-web3-react
```

## Usage

```typescript
import { initializeConnector } from '@web3-react/core'
import { AmbireConnector } from '@ambire/login-sdk-web3-react'

const sdkOptions = {
  dappName: 'Your DApp name',
  dappIconPath: '<url-to-DApp-icon>',       // optional, but need for DApp icon to be shown in Ambire Login modal
}

const [ambireConnector, ambireConnectHooks] = initializeConnector<AmbireConnector>(
  (actions) => new AmbireConnector(actions, sdkOptions, onErrorFunction)
)
```
