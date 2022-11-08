document.getElementById("connect").addEventListener('click', function(){
    this.style.display = 'none'
    let iframeElement = document.getElementById("ambire-sdk-iframe")
    iframeElement.style.width = '100%'
    iframeElement.style.height = '600px'

    let iframe = getLoginIframe()
    iframeElement.innerHTML = iframe
})

// dapp handler
window.addEventListener('loginSuccess', (e) => {
    document.getElementById("wallet-address").innerHTML = `Wallet address: ${e.detail.address}`
}, false)