window.addEventListener('message', (e) => {
    if (e.origin !== 'http://localhost:3000') return

    console.log(`ambire login details: ${JSON.stringify(e.data)}`)
    document.getElementById("wallet-address").innerHTML = `Wallet address: ${e.data.address}`
    document.getElementById("ambire-sdk-iframe").remove()
}, false)

let iframe = getIframe()
document.getElementById("ambire-sdk-iframe").innerHTML = iframe
