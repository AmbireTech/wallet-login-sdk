window.AmbireSDK = function (opt = {}) {
    const self = this

    this.dappName = opt.dappName ?? 'Unknown Dapp'
    this.wrapperElement = document.getElementById(opt.wrapperElementId ?? "ambire-sdk-wrapper")
    this.iframeElement = document.getElementById(opt.iframeElementId ?? "ambire-sdk-iframe")
    this.connectButton = document.getElementById(opt.connectButtonId ?? "ambire-sdk-connect-btn")
    this.closeButton = document.getElementById(opt.closeButtonId ?? "ambire-sdk-iframe-close")

    this.hideIframe = function() {
        self.iframeElement.style.visibility = 'hidden'
        self.iframeElement.style.opacity = 0
        self.iframeElement.style.pointerEvents = 'none'

        self.closeButton.style.display = 'none'

        document.body.style.pointerEvents = 'auto'
        self.wrapperElement.style.visibility = 'hidden'
        self.wrapperElement.style.opacity = 0
        self.wrapperElement.style.pointerEvents = 'auto'
    }

    this.showIframe = function(url) {
        document.body.style.pointerEvents = 'none'
        self.wrapperElement.style.visibility = 'visible'
        self.wrapperElement.style.opacity = 1
        self.wrapperElement.style.pointerEvents = 'none'

        self.iframeElement.style.width = '60%'
        self.iframeElement.style.height = '600px'

        self.iframeElement.style.visibility = 'visible'
        self.iframeElement.style.opacity = 1
        self.iframeElement.style.pointerEvents = 'auto'

        self.iframeElement.innerHTML = `<iframe src="`+ url +`" width="100%" height="100%" frameborder="0"/>`

        self.closeButton.style.display = 'block'
        self.closeButton.style.zIndex = 999
        self.closeButton.style.pointerEvents = 'auto'
    }

    this.openLogin = function() {
        // temp code
        self.showIframe(opt.walletUrl + '/#/email-login-iframe')
    }

    this.openSignMessage = function(type, messageToSign) {
        if (type === 'personal_sign') {
            if (!messageToSign || typeof messageToSign !== 'string') {
                return alert('Invalid input for message')
            }

            // convert string to hex
            messageToSign = '0x' + messageToSign.split('')
                .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
                .join('')
        } else if (type === 'eth_signTypedData') {
            messageToSign = encodeURIComponent(JSON.stringify(messageToSign))
        } else {
            return alert('Invalid sign type')
        }

        self.showIframe(`${opt.walletUrl}/#/sign-message-sdk/${type}/${messageToSign}`)

        window.addEventListener('message', (e) => {
            if (e.origin !== opt.walletUrl) return
            if (e.data.type !== 'signClose') return
            self.hideIframe()
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
            self.hideIframe()
        }, false)
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

            self.hideIframe()
            callback(e.data.address)
        })
    }

    // ambire-registration-success listener
    this.onRegistrationSuccess = function(callback) {
        window.addEventListener('message', (e) => {
            if (e.origin !== opt.walletUrl || e.data.type != 'registrationSuccess') return

            const buyCrypto = opt.walletUrl + '/#/on-ramp-sdk/' + opt.chainID
            self.iframeElement.innerHTML = `<iframe src="`+ buyCrypto +`" width="100%" height="100%" frameborder="0"/>`
            callback(e.data.address)
        })

        window.addEventListener('message', (e) => {
            if (e.origin !== opt.walletUrl || e.data.type != 'finishRamp') return

            self.hideIframe()
        })
    }

    // handlers
    window.addEventListener('keyup', function(e) {
        if (e.key == 'Escape') {
            self.hideIframe()
        }
    })
    this.connectButton.addEventListener('click', function() {
        self.openLogin()
    })
    this.closeButton.addEventListener('click', function() {
        self.hideIframe()
    })
}