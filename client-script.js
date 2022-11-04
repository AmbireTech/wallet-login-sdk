window.addEventListener('message', (e) => {
    if (e.origin !== 'http://localhost:3000') return

    console.log(`ambire login details: ${JSON.stringify(e.data)}`)
    document.getElementById("wallet-address").innerHTML = `Wallet address: ${e.data.address}`
    document.getElementById("ambire-sdk-iframe").remove()
}, false)


document.getElementById("connect").addEventListener('click', function(){
    this.style.display = 'none'
    let iframeElement = document.getElementById("ambire-sdk-iframe")
    iframeElement.style.width = '100%'
    iframeElement.style.height = '600px'

    let iframe = getLoginIframe()
    iframeElement.innerHTML = iframe
})
