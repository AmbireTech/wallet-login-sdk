const sdkCore = function (opt = {}) {
  const self = this

  this.dappName = opt.dappName ?? 'Unknown Dapp'
  this.dappIconPath = opt.dappIconPath ?? ''
  this.wrapperElementId = opt.wrapperElementId ?? 'ambire-sdk-wrapper'
  this.wrapperElement = null

  this.iframe = null

  this.initSdkWrapperDiv = function (id = 'ambire-sdk-wrapper') {
    if (self.wrapperElement) return

    self.wrapperElement = document.getElementById(id)

    if (self.wrapperElement) return

    self.wrapperElement = document.createElement('div')
    self.wrapperElement.id = id
    document.body.appendChild(self.wrapperElement)
  }

  this.hideIframe = function () {
    document.body.style.pointerEvents = 'auto'

    self.wrapperElement.classList.remove('visible')

    const wrapperChildren = self.wrapperElement?.childNodes

    if (wrapperChildren?.length > 0) {
      wrapperChildren.forEach((child) => {
        child.remove()
      })
    }
  }

  this.showIframe = function (url) {
    self.initSdkWrapperDiv(self.wrapperElementId)

    document.body.style.pointerEvents = 'none'

    self.wrapperElement.classList.add('visible')

    self.iframe = document.createElement('iframe')

    self.iframe.src = url
    self.iframe.width = '480px'
    self.iframe.height = '600px'
    self.iframe.id = 'ambire-sdk-iframe'
    self.wrapperElement.appendChild(self.iframe)
  }

  this.openLogin = function (chainInfo = null) {
    let query = `?dappOrigin=${window.location.origin}&dappName=${self.dappName}&dappIcon=${self.dappIconPath}`
    query = chainInfo ? `${query}&chainId=${chainInfo.chainId}` : query
    self.showIframe(opt.walletUrl + '/#/sdk/email-login' + query)
  }

  this.openLogout = function () {
    let query = `?dappOrigin=${window.location.origin}`
    self.showIframe(opt.walletUrl + '/#/sdk/logout' + query)
  }

  this.openSignMessage = function (type, messageToSign) {
    if (!messageToSign) return alert('Invalid input for message')

    if (type === 'eth_sign') {
      if (typeof messageToSign !== 'string') {
        return alert('Invalid input for message')
      }
    } else if (type === 'personal_sign') {
      if (typeof messageToSign !== 'string') {
        return alert('Invalid input for message')
      }

      // convert string to hex
      messageToSign = messageToSign.match(/^0x[0-9A-Fa-f]+$/g)
        ? messageToSign
        : '0x' +
          messageToSign
            .split('')
            .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
            .join('')
    } else if (['eth_signTypedData', 'eth_signTypedData_v4'].includes(type)) {
      messageToSign = typeof messageToSign === 'string' ? messageToSign : JSON.stringify(messageToSign)
      messageToSign = encodeURIComponent(messageToSign)
    } else {
      return alert('Invalid sign type')
    }

    self.showIframe(`${opt.walletUrl}/#/sdk/sign-message/${type}/${messageToSign}?dappOrigin=${window.location.origin}`)
  }

  this.openSendTransaction = function (to, value, data) {
    if (!to || !value || !data || typeof to !== 'string' || typeof value !== 'string' || typeof data !== 'string') {
      return alert('Invalid txn input data')
    }
    self.showIframe(`${opt.walletUrl}/#/sdk/send-transaction/${to}/${value}/${data}`)
  }

  // emit event
  this.emit = function (eventName, data = {}) {
    const event = new CustomEvent(eventName, { detail: { ...data } })
    window.dispatchEvent(event)
    console.log(`${eventName} was dispatched`)
  }

  // generic event listener
  this.on = function (eventName, callback) {
    // console.log(`${eventName} was received`)
    window.addEventListener(eventName, function (event) {
      callback(event)
    })
  }

  this.onMessage = function (messageType, sdkCallback, clientCallback = undefined) {
    window.addEventListener('message', (e) => {
      if (e.origin !== self.getOrigin() || e.data.type !== messageType) return

      sdkCallback()

      if (clientCallback) clientCallback(e.data)
    })
  }

  this.onAlreadyLoggedIn = function (callback) {
    self.onMessage('alreadyLoggedIn', () => self.hideIframe(), callback)
  }

  // ambire-login-success listener
  this.onLoginSuccess = function (callback) {
    self.onMessage('loginSuccess', () => self.hideIframe(), callback)
  }

  // ambire-registration-success listener
  this.onRegistrationSuccess = function (callback) {
    self.onMessage(
      'registrationSuccess',
      () => {
        self.iframe.src = opt.walletUrl + '/#/sdk/on-ramp'
      },
      callback
    )

    self.onMessage('finishRamp', () => self.hideIframe())
  }

  this.onLogoutSuccess = function (callback) {
    self.onMessage('logoutSuccess', () => self.hideIframe(), callback)
  }

  this.onMsgRejected = function (callback) {
    self.onMessage('msgRejected', () => self.hideIframe(), callback)
  }

  this.onMsgSigned = function (callback) {
    self.onMessage('msgSigned', () => self.hideIframe(), callback)
  }

  this.onTxnRejected = function (callback) {
    self.onMessage('txnRejected', () => self.hideIframe(), callback)
  }

  this.onTxnSent = function (callback) {
    self.onMessage('txnSent', () => self.hideIframe(), callback)
  }

  this.onActionRejected = function (callback) {
    self.onMessage('actionRejected', () => self.hideIframe(), callback)
  }

  // handlers
  window.addEventListener('keyup', function (e) {
    if (e.key === 'Escape') {
      self.hideIframe()
    }
  })

  window.addEventListener('message', (e) => {
    if (e.origin !== self.getOrigin() || e.data.type !== 'actionClose') return

    self.hideIframe()
  })

  // the origin of opt.walletUrl should be protocol://website.name without any additinal "/"
  // symbols at the end. Otherwise, messages do not pass. This code ensures the correct
  // origin is passed
  this.getOrigin = () => {
    return opt.walletUrl.split('/').slice(0, 3).join('/')
  }
}

export { sdkCore }