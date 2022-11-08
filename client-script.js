const sdk = new window.AmbireSDK({
    dappName: 'dapp1',
    iframeElementId: 'ambire-sdk-iframe',
    connectButtonId: 'connect',
    logoutButtonId: 'logout',
    addressElementId: 'wallet-address',
})
sdk.onLoginSuccess(function(address) {
    console.log(`Client onLoginSuccess, address is: ${address}`)
})