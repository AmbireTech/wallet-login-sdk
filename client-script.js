const sdk = new window.AmbireSDK({
    walletUrl: 'http://localhost:3000',
    dappName: 'dapp1',
    iframeElementId: 'ambire-sdk-iframe',
    connectButtonId: 'connect',
    logoutButtonId: 'logout',
    addressElementId: 'wallet-address',
})
sdk.onLoginSuccess(function(address) {
    document.getElementById("wallet-address").innerHTML = `Wallet address: ${address}`
})
