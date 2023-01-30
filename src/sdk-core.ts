import { sdkParamsType } from './types/index'

let self: AmbireLoginSDK

class AmbireLoginSDK {

  walletUrl: string
  dappName: string
  dappIconPath: string
  wrapperElementId: string
  wrapperElement: any
  iframe: any

  constructor(opt:  sdkParamsType) {
    self = this

    this.walletUrl = opt.walletUrl ?? 'Unknown Dapp'
    this.dappName = opt.dappName ?? 'Unknown Dapp'
    this.dappIconPath = opt.dappIconPath ?? ''
    this.wrapperElementId = opt.wrapperElementId ?? 'ambire-sdk-wrapper'
    this.wrapperElement = null
    this.iframe = null

    // hardcoded handlers
    window.addEventListener('keyup', function (e) {
      if (e.key === 'Escape') {
        self.hideIframe()
      }
    })
    window.addEventListener('message', (e) => {
      if (e.origin !== self.getOrigin() || e.data.type !== 'actionClose') return

      self.hideIframe()
    })
  }

  initSdkWrapperDiv(id = 'ambire-sdk-wrapper') {
    if (self.wrapperElement) return

    self.wrapperElement = document.getElementById(id)

    if (self.wrapperElement) return

    self.wrapperElement = document.createElement('div')
    self.wrapperElement.id = id
    document.body.appendChild(self.wrapperElement)
  }

  hideIframe() {
    document.body.style.pointerEvents = 'auto'

    self.wrapperElement.classList.remove('visible')

    const wrapperChildren = self.wrapperElement?.childNodes

    if (wrapperChildren?.length > 0) {
      wrapperChildren.forEach((child: any) => {
        child.remove()
      })
    }
  }

  showIframe(url: string) {
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

  openLogin(chainInfo?: { chainId: number }) {
    let query = `?dappOrigin=${window.location.origin}&dappName=${self.dappName}&dappIcon=${self.dappIconPath}`
    query = chainInfo ? `${query}&chainId=${chainInfo.chainId}` : query
    self.showIframe(this.walletUrl + '/#/sdk/email-login' + query)
  }

  openLogout() {
    let query = `?dappOrigin=${window.location.origin}`
    self.showIframe(this.walletUrl + '/#/sdk/logout' + query)
  }

  openSignMessage(type: string, messageToSign: string) {
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

    self.showIframe(`${this.walletUrl}/#/sdk/sign-message/${type}/${messageToSign}?dappOrigin=${window.location.origin}`)
  }

  openSendTransaction(to: string, value: string, data: string) {
    if (!to || !value || !data || typeof to !== 'string' || typeof value !== 'string' || typeof data !== 'string') {
      return alert('Invalid txn input data')
    }
    self.showIframe(`${this.walletUrl}/#/sdk/send-transaction/${to}/${value}/${data}`)
  }

  // emit event
  emit(eventName: string, data = {}) {
    const event = new CustomEvent(eventName, { detail: { ...data } })
    window.dispatchEvent(event)
    console.log(`${eventName} was dispatched`)
  }

  // generic event listener
  on(eventName: string, callback: any) {
    // console.log(`${eventName} was received`)
    window.addEventListener(eventName, function (event) {
      callback(event)
    })
  }

  onMessage(messageType: string, sdkCallback: any, clientCallback?: any) {
    window.addEventListener('message', (e) => {
      if (e.origin !== self.getOrigin() || e.data.type !== messageType) return

      sdkCallback()

      if (clientCallback) clientCallback(e.data)
    })
  }

  onAlreadyLoggedIn(callback: any) {
    self.onMessage('alreadyLoggedIn', () => self.hideIframe(), callback)
  }

  // ambire-login-success listener
  onLoginSuccess(callback: any) {
    self.onMessage('loginSuccess', () => self.hideIframe(), callback)
  }

  // ambire-registration-success listener
  onRegistrationSuccess(callback: any) {
    self.onMessage(
      'registrationSuccess',
      () => {
        self.iframe.src = this.walletUrl + '/#/sdk/on-ramp'
      },
      callback
    )

    self.onMessage('finishRamp', () => self.hideIframe())
  }

  onLogoutSuccess(callback: any) {
    self.onMessage('logoutSuccess', () => self.hideIframe(), callback)
  }

  onMsgRejected(callback: any) {
    self.onMessage('msgRejected', () => self.hideIframe(), callback)
  }

  onMsgSigned(callback: any) {
    self.onMessage('msgSigned', () => self.hideIframe(), callback)
  }

  onTxnRejected(callback: any) {
    self.onMessage('txnRejected', () => self.hideIframe(), callback)
  }

  onTxnSent(callback: any) {
    self.onMessage('txnSent', () => self.hideIframe(), callback)
  }

  onActionRejected(callback: any) {
    self.onMessage('actionRejected', () => self.hideIframe(), callback)
  }

  // the origin of this.walletUrl should be protocol://website.name without any additinal "/"
  // symbols at the end. Otherwise, messages do not pass. This code ensures the correct
  // origin is passed
  getOrigin() {
    return this.walletUrl.split('/').slice(0, 3).join('/')
  }
}

export { AmbireLoginSDK }
