# Ambire Wallet Login SDK

This is a monorepo hosting all SDK packages that can be used for connecting Dapps to Ambire Wallet.

Included packages are the following:
- [@ambire/login-sdk-core](https://github.com/AmbireTech/wallet-login-sdk/tree/main/packages/core)
package holdind the main SDK logic. Its purpose is to provide a framework agnostic API for implementing login with Ambire Wallet in any JS based Dapp.
- [@ambire/login-sdk-web3-react](https://github.com/AmbireTech/wallet-login-sdk/tree/main/packages/web3-react) - a convenience package for providing ready-to-use components for Dapps using the [web3-react](https://www.npmjs.com/package/web3-react) library.
- [@ambire/login-sdk-web3-onboard](https://github.com/AmbireTech/wallet-login-sdk/tree/main/packages/web3-onboard) - a convenience package for providing ready-to-use components and modules for Dapps using the [web3-onboard](https://www.npmjs.com/package/@web3-onboard/core) library.
- [@ambire/login-sdk-browser](https://github.com/AmbireTech/wallet-login-sdk/tree/main/packages/browser) - package for providing browser-ready and minifier SDK code for usage in Dapps with legacy JS code.

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
