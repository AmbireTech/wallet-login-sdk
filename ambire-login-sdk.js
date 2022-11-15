window.AmbireSDK = function (opt = {}) {
    const self = this

    this.dappName = opt.dappName ?? 'Unknown Dapp'
    this.iframeElement = document.getElementById(opt.iframeElementId ?? "ambire-sdk-iframe")
    this.connectButton = document.getElementById(opt.connectButtonId ?? "ambire-sdk-connect-btn")
    this.logoutButton = document.getElementById(opt.logoutButtonId ?? "ambire-sdk-logout-btn")
    this.addressElement = document.getElementById(opt.addressElementId ?? "ambire-sdk-wallet-address")
    this.sendTxnDiv = document.getElementById(opt.sendTxDivElementId ?? "ambire-sdk-send-transaction")
    this.sendTxnButton = document.getElementById(opt.sendTxButtonElementId ?? "ambire-sdk-send-transaction-btn")

    // init
    const wallet = window.localStorage.getItem('wallet_address')
    if (wallet) {
        this.addressElement.innerHTML = `Wallet address: ${wallet}`
        this.connectButton.style.display = 'none'
        this.logoutButton.style.display = 'block'
        this.sendTxnDiv.style.display = 'block'
    } else {
        this.addressElement.innerHTML = ''
        this.connectButton.style.display = 'block'
        this.logoutButton.style.display = 'none'
        this.sendTxnDiv.style.display = 'none'
    }
    this.connectButton.addEventListener('click', function() {
        self.openLogin()
    })
    this.sendTxnButton.addEventListener('click', function() {
        const inputs = self.sendTxnDiv.getElementsByTagName('input')
        self.openSendTransaction(
            inputs[0].value,
            inputs[1].value,
            inputs[2].value
        )
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
        self.showIframe(opt.walletUrl + '/#/email-login-iframe')
    }

    this.openSignMessage = function() {
        // TODO
    }

    this.openSendTransaction = function(to, value, data) {
        if (
            !to || !value || !data
            || typeof to !== 'string'
            || typeof value !== 'string'
            || typeof data !== 'string'
        ) {
            return alert('Invalid txn input data')
        }
        self.showIframe(`${opt.walletUrl}/#/sign-sdk/${to}/${value}/${data}`)

        window.addEventListener('message', (e) => {
            if (e.origin !== opt.walletUrl) return
            if (e.data.type !== 'signClose') return
            this.hideIframe()
        }, false)
    }

    this.logout = function() {
        // TODO

        if (!window.localStorage.getItem('wallet_address')) return

        window.localStorage.removeItem('wallet_address')
        self.logoutButton.style.display = 'none'
        self.addressElement.innerHTML = ''
        self.connectButton.style.display = 'block'
        self.sendTxnDiv.style.display = 'none'
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
            if (e.origin !== opt.walletUrl || e.data.type !== 'loginSuccess') return

            self.addressElement.innerHTML = `Wallet address: ${e.data.address}`
            self.sendTxnDiv.style.display = 'block'
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
            const buyCrypto = opt.walletUrl + '/#/on-ramp-sdk/' + opt.chainID
            self.iframeElement.innerHTML = `<iframe src="`+ buyCrypto +`" width="100%" height="100%" frameborder="0"/>`

            callback(e.data.address)
        })

        window.addEventListener('message', (e) => {
            if (e.origin !== opt.walletUrl || e.data.type != 'openRamp') return

            const timestamp = Date.now() // tested, correct timestamp
            const address = e.data.address
            const merchantCode = "xubo_test"
            const networkCode = e.data.networkCode

            // TO DO: signature
            const signatureToSign = "cryptoAddress="+address+"&\
                cryptoNetwork="+networkCode+"&\
                merchantCode="+merchantCode+"&\
                timestamp="+timestamp
            const signature = ""

            const onRampUrl = "https://www.binancecnt.com/en/pre-connect?merchantCode="+merchantCode+"&timestamp="+timestamp+"&cryptoAddress="+address+"&cryptoNetwork="+networkCode+"&signature="+signature
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