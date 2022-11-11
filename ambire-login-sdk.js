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
        self.iframeElement.innerHTML = ''
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
        this.showIframe(opt.walletUrl + '/#/email-login-iframe')
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
            if (e.origin !== opt.walletUrl || e.data.type != 'loginSuccess') return

            self.addressElement.innerHTML = `Wallet address: ${e.data.address}`
            this.hideIframe()
            self.logoutButton.style.display = 'block'
            this.setAddress(e.data.address)

            callback(e.data.address)
        })
    }

    // ambire-registration-success listener
    this.onRegistrationSuccess = function(callback) {
        window.addEventListener('message', (e) => {
            if (e.origin !== opt.walletUrl || e.data.type != 'registrationSuccess') return

            self.addressElement.innerHTML = `Wallet address: ${e.data.address}`
            self.logoutButton.style.display = 'block'
            this.setAddress(e.data.address)
            // const onRampUrl = 'https://sandbox.bifinity.org/en/pre-connect?merchantCode=xubo_test&timestamp=1663535952836'
            const buyCrypto = opt.walletUrl + '/#/on-ramp-sdk'
            self.iframeElement.innerHTML = `<iframe src="`+ buyCrypto +`" width="100%" height="100%" frameborder="0"/>`

            callback(e.data.address)
        })

        window.addEventListener('message', (e) => {
            if (e.origin !== opt.walletUrl || e.data.type != 'openRamp') return

            const onRampUrl = 'https://sandbox.bifinity.org/en/pre-connect?merchantCode=xubo_test&timestamp=1663535952836'
            self.iframeElement.innerHTML = `<iframe src="`+ onRampUrl +`" width="100%" height="100%" frameborder="0"/>`
        })

        window.addEventListener('message', (e) => {
            if (e.origin !== opt.walletUrl || e.data.type != 'cancelRamp') return

            this.hideIframe()
        })
    }

    this.setAddress = function(address) {
        window.localStorage.setItem('wallet_address', address)
    }
}