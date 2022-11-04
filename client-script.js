const connectButton = document.getElementById("connect")
const logoutButton = document.getElementById("logout")
const addressElement = document.getElementById("wallet-address")
const iframeElement = document.getElementById("ambire-sdk-iframe")

window.addEventListener('message', (e) => {
    if (e.origin !== 'http://localhost:3000') return

    console.log(`ambire login details: ${JSON.stringify(e.data)}`)
    addressElement.innerHTML = `Wallet address: ${e.data.address}`
    iframeElement.remove()

    window.localStorage.setItem('wallet_address', e.data.address)
    logoutButton.style.display = 'block'
}, false)

connectButton.addEventListener('click', function(){
    this.style.display = 'none'
    // let iframeElement = iframeDiv
    iframeElement.style.width = '100%'
    iframeElement.style.height = '600px'

    let iframe = getLoginIframe()
    iframeElement.innerHTML = iframe
})

logoutButton.addEventListener('click', function(){
    if (!window.localStorage.getItem('wallet_address')) return

    window.localStorage.removeItem('wallet_address')
    this.style.display = 'none'
    addressElement.innerHTML = ''
    connectButton.style.display = 'block'
})

const wallet = window.localStorage.getItem('wallet_address')
if (wallet) {
    addressElement.innerHTML = `Wallet address: ${wallet}`
    connectButton.style.display = 'none'
    logoutButton.style.display = 'block'
} else {
    connectButton.style.display = 'block'
    addressElement.innerHTML = ''
    logoutButton.style.display = 'none'
}
