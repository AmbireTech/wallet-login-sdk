# @ambire/login-sdk-web3-onboard

A package for integrating Ambire Wallet Login for dApps using web3-onboard.

# Install

```console
npm install @ambire/login-sdk-web3-onboard
```

## Usage

```typescript
import Onboard from '@web3-onboard/core'
import { AmbireWalletModule } from '@ambire/login-sdk-web3-onboard'

const ambireWallet = AmbireWalletModule({
    dappName: 'Your dApp name',
    dappIconPath: '<url-to-dApp-icon>'      // optional, but needed for dApp icon to be shown in Ambire Login modal
})

const onboard = Onboard({
    wallets: [ambireWallet],
    chains: [
        {
            id: '0x1',
            token: 'ETH',
            label: 'Ethereum Mainnet',
            rpcUrl: '<RPC provider URL>'
          },
          // ... other chains
    ],
    appMetadata: {
        name: 'Your dApp name',
        icon: '',
        description: 'Your dApp',
    },
    accountCenter: {
    desktop: {
        enabled: false,
    },
    },
})

const wallets = await onboard.connectWallet()
```
