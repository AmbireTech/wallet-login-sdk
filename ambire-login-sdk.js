function getIframe() {
    return `<iframe src="http://localhost:3000/#/email-login-iframe" width="100%" height="100%" frameborder="0"/>`
}

// window.addEventListener('login-success', (e) => {
//     console.log(`ambire login details: ${e.detail}`)
//     document.getElementById("wallet-address").innerHTML = e.detail
// }, false)

window.addEventListener('message', (e) => {
    if (e.origin !== 'http://localhost:3000') return

    console.log(`ambire login details: ${JSON.stringify(e.data)}`)
    document.getElementById("wallet-address").innerHTML = `Wallet address: ${e.data.address}`
}, false)

let iframe = getIframe()
document.getElementById("ambire-sdk-iframe").innerHTML = iframe
