window.AmbireSDK = function (opt = {}) {
    const self = this

    this.dappName = opt.dappName ?? 'Unknown Dapp'
    this.iframeElement = document.getElementById(opt.iframeElementId ?? "ambire-sdk-iframe")
    this.iframeCloseButton = document.getElementById(opt.iframeCloseButtontId ?? "ambire-sdk-iframe-close")
    this.connectButton = document.getElementById(opt.connectButtonId ?? "ambire-sdk-connect-btn")
    this.logoutButton = document.getElementById(opt.logoutButtonId ?? "ambire-sdk-logout-btn")
    this.addressElement = document.getElementById(opt.addressElementId ?? "ambire-sdk-wallet-address")
    this.sendTxnDiv = document.getElementById(opt.sendTxDivElementId ?? "ambire-sdk-send-transaction")
    this.sendTxnButton = document.getElementById(opt.sendTxButtonElementId ?? "ambire-sdk-send-transaction-btn")
    this.signMsgDiv = document.getElementById(opt.signMsgDivElementId ?? "ambire-sdk-sign-message")
    this.signMsgButton = document.getElementById(opt.sendTxButtonElementId ?? "ambire-sdk-sign-message-btn")

    // init
    const wallet = window.localStorage.getItem('wallet_address')
    if (wallet) {
        this.addressElement.innerHTML = `Wallet address: ${wallet}`
        this.connectButton.style.display = 'none'
        this.logoutButton.style.display = 'block'
        this.sendTxnDiv.style.display = 'block'
        this.signMsgDiv.style.display = 'block'
    } else {
        this.addressElement.innerHTML = ''
        this.connectButton.style.display = 'block'
        this.logoutButton.style.display = 'none'
        this.sendTxnDiv.style.display = 'none'
        this.signMsgDiv.style.display = 'none'
    }
    this.iframeCloseButton.style.display = 'none'

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
    this.signMsgButton.addEventListener('click', function() {
        const inputs = self.signMsgDiv.getElementsByTagName('input')
        self.openSignMessage(inputs[0].value)
    })
    this.logoutButton.addEventListener('click', function() {
        self.logout()
    })
    this.iframeCloseButton.addEventListener('click', function() {
        self.hideIframe()
    })

    this.hideIframe = function() {
        self.iframeElement.style.display = 'none'
        self.iframeCloseButton.style.display = 'none'
    }

    this.showIframe = function(url) {
        self.iframeElement.style.display = 'block'
        self.iframeElement.style.width = '320px'
        self.iframeElement.style.height = '600px'
        self.iframeElement.innerHTML = `<iframe src="`+ url +`" width="100%" height="100%" frameborder="0"/>`
        self.iframeCloseButton.style.display = 'block'
    }

    this.openLogin = function() {
        // TODO

        // temp code
        self.connectButton.style.display = 'none'
        self.showIframe(opt.walletUrl + '/#/email-login-iframe')
    }

    this.openSignMessage = function(messageToSign) {
        // TODO

        if (!messageToSign || typeof messageToSign !== 'string') {
            return alert('Invalid input for message')
        }
        // convert string to hex
        const msgInHex = '0x' + messageToSign.split('')
            .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
            .join('')
        self.showIframe(`${opt.walletUrl}/#/sign-message-sdk/${msgInHex}`)

        window.addEventListener('message', (e) => {
            if (e.origin !== opt.walletUrl) return
            if (e.data.type !== 'signClose') return
            this.hideIframe()
        }, false)
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
        self.showIframe(`${opt.walletUrl}/#/send-transaction-sdk/${to}/${value}/${data}`)

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
        self.signMsgDiv.style.display = 'none'
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

    this.handleMessage = function(callback) {
        window.addEventListener('message', (e) => {
            if (e.origin !== opt.walletUrl) return
            if (e.data.type !== 'loginSuccess') return

            // console.log(`ambire login details: ${JSON.stringify(e.data)}`)
            self.addressElement.innerHTML = `Wallet address: ${e.data.address}`
            self.sendTxnDiv.style.display = 'block'
            self.signMsgDiv.style.display = 'block'
            this.hideIframe()
            self.logoutButton.style.display = 'block'
            window.localStorage.setItem('wallet_address', e.data.address)

            callback(e.data.address)
        }, false)
    }

    // ambire-login-success listener
    this.onLoginSuccess = function(callback) {
        this.handleMessage(callback)
    }

    // ambire-registration-success listener
    this.onRegistrationSuccess = function(callback) {
        this.handleMessage(callback)
    }
}