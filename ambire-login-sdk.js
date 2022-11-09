const walletUrl = 'http://localhost:3000'
window.AmbireSDK = function (opt = {}) {
    const self = this

    this.dappName = opt.dappName ?? 'Unknown Dapp'
    this.iframeElement = document.getElementById(opt.iframeElementId ?? "ambire-sdk-iframe")
    this.connectButton = document.getElementById(opt.connectButtonId ?? "ambire-sdk-connect-btn")
    this.logoutButton = document.getElementById(opt.logoutButtonId ?? "ambire-sdk-logout-btn")
    this.addressElement = document.getElementById(opt.addressElementId ?? "ambire-sdk-wallet-address")

    // init
    const wallet = window.localStorage.getItem('wallet_address')
    if (wallet) {
        this.addressElement.innerHTML = `Wallet address: ${wallet}`
        this.connectButton.style.display = 'none'
        this.logoutButton.style.display = 'block'
    } else {
        this.addressElement.innerHTML = ''
        this.connectButton.style.display = 'block'
        this.logoutButton.style.display = 'none'
    }
    this.connectButton.addEventListener('click', function() {
        self.openLogin()
    })
    this.logoutButton.addEventListener('click', function() {
        self.logout()
    })

    this.hideIframe = function() {
        self.iframeElement.style.display = 'none'
    }

    this.showIframe = function(url) {
        self.iframeElement.style.display = 'block'
        self.iframeElement.style.width = '320px'
        self.iframeElement.style.height = '600px'
        self.iframeElement.innerHTML = `<iframe src="`+ url +`" width="100%" height="100%" frameborder="0"/>`
    }

    this.openLogin = function() {
        // TODO

        // temp code
        self.connectButton.style.display = 'none'
        this.showIframe(walletUrl + '/#/email-login-iframe')
    }

    this.openSignMessage = function() {
        // TODO
    }

    this.openSendTransaction = function() {
        // TODO
    }

    this.logout = function() {
        // TODO

        if (!window.localStorage.getItem('wallet_address')) return

        window.localStorage.removeItem('wallet_address')
        self.logoutButton.style.display = 'none'
        self.addressElement.innerHTML = ''
        self.connectButton.style.display = 'block'
    }

    // emit event
    this.emit = function(eventName, data = {}) {
        const event = new CustomEvent(eventName, { detail: { ...data }})
        window.dispatchEvent(event)
        console.log(`${eventName} was dispatched`)
    }

    // generic event listener
    this.on = function(eventName, callback) {
        // console.log(`${eventName} was received`)
        window.addEventListener(eventName, function(event) {
            callback(event)
        })
    }

    // ambire-login-success listener
    this.onLoginSuccess = function(callback) {
        window.addEventListener('message', (e) => {
            if (e.origin !== walletUrl) return

            // console.log(`ambire login details: ${JSON.stringify(e.data)}`)
            self.addressElement.innerHTML = `Wallet address: ${e.data.address}`
            this.hideIframe()
            self.logoutButton.style.display = 'block'
            window.localStorage.setItem('wallet_address', e.data.address)

            callback(e.data.address)
        }, false)
    }
}