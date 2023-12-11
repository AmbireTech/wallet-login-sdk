# Ambire Wallet Login SDK

Welcome to the home of Ambire Wallet Login SDK.

This is a set of packages you can use to provide an option for your dApp users to login/connect with Ambire Wallet.

## Benefits of using the SDK

**Easy onboarding:** easily onboard new users to your dApp: even if they do not have a Web3 wallet set-up, the Ambire Login SDK allows them to create a self-custodial account using their email in mere seconds

**Tight integration:** seamlessly integrated into web3-react and web3-onboard

**FIAT on-ramp:** built-in FIAT on-ramp allows buying stablecoins with a credit card

**Interoperability:** once the user creates their Web3 account, it's automatically imported into the full-featured standalone Ambire web wallet, which can be then connected to other dApps; furthermore, once the account has been created, the account will be easily accessible in any other dApp that integrates the login SDK

**Easier connection to Ambire:** for Ambire users, using the login SDK is much easier than using WalletConnect

## Packages

Included packages in this monorepo:
- [@ambire/login-sdk-core](https://github.com/AmbireTech/wallet-login-sdk/tree/main/packages/core)
- package holding the main SDK logic. Its purpose is to provide a framework-agnostic API for implementing login with Ambire Wallet in any JS based dApp.
- [@ambire/login-sdk-web3-react](https://github.com/AmbireTech/wallet-login-sdk/tree/main/packages/web3-react) - a convenience package for providing ready-to-use components for dApps using the [web3-react](https://www.npmjs.com/package/web3-react) library.
- [@ambire/login-sdk-web3-onboard](https://github.com/AmbireTech/wallet-login-sdk/tree/main/packages/web3-onboard) - a convenience package for providing ready-to-use modules for dApps using the [web3-onboard](https://www.npmjs.com/package/@web3-onboard/core) library.
- [@ambire/login-sdk-browser](https://github.com/AmbireTech/wallet-login-sdk/tree/main/packages/browser) - package for providing browser-ready and minified code for usage of the SDK API in dApps with legacy JS code.

## Demo

Example implementation of Ambire SDK Login with Uniswap: [Demo dApp](https://ambiretech.github.io/uniswap-ambire-sdk-demo)

![demo sdk image 1](/demo/demo-sdk-1.png)
![demo sdk image 2](/demo/demo-sdk-2.png)

# Development

Required node verion: 16

## Build after changes to packages:
```
npm install
npx lerna run build
```

## Publish a new version:
```
npx lerna publish
```
