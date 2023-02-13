import { sdkParamsType } from './types/index'
import './styles/main.css'

class AmbireLoginSDK {
  walletUrl: string
  dappName: string
  dappIconPath: string
  wrapperElementId: string
  wrapperElement: any
  iframe: any

  constructor(opt:  sdkParamsType) {
    this.walletUrl = opt.walletUrl ?? 'Unknown Dapp'
    this.dappName = opt.dappName ?? 'Unknown Dapp test1'
    this.dappIconPath = opt.dappIconPath ?? ''
    this.wrapperElementId = opt.wrapperElementId ?? 'ambire-sdk-wrapper'
    this.wrapperElement = null
    this.iframe = null

    // hardcoded handlers
    window.addEventListener('keyup', (e) => {
      if (e.key === 'Escape') {
        this.hideIframe()
      }
    })
    window.addEventListener('message', (e) => {
      if (e.origin !== this.getOrigin() || e.data.type !== 'actionClose') return

      this.hideIframe()
    })
  }

  initSdkWrapperDiv(id = 'ambire-sdk-wrapper') {
    if (this.wrapperElement) return

    this.wrapperElement = document.getElementById(id)

    if (this.wrapperElement) return

    this.wrapperElement = document.createElement('div')
    this.wrapperElement.id = id
    this.wrapperElement.classList.add('ambireSDKmodal')
    document.body.appendChild(this.wrapperElement)
  }

  hideIframe() {
    document.body.style.pointerEvents = 'auto'

    this.wrapperElement.classList.remove('ambireSDKmodalVisible')

    const wrapperChildren = this.wrapperElement?.childNodes

    if (wrapperChildren?.length > 0) {
      wrapperChildren.forEach((child: any) => {
        child.remove()
      })
    }
  }

  showIframe(url: string) {
    this.initSdkWrapperDiv(this.wrapperElementId)

    document.body.style.pointerEvents = 'none'

    this.wrapperElement.classList.add('ambireSDKmodalVisible')

    if (!this.wrapperElement.childNodes || this.wrapperElement.childNodes.length == 0) {
      this.iframe = document.createElement('iframe')
      this.iframe.src = url
      this.iframe.width = '480px'
      this.iframe.height = '600px'
      this.iframe.id = 'ambire-sdk-iframe'
      this.iframe.classList.add('ambireSDKiframe')
      this.wrapperElement.appendChild(this.iframe)
    }
  }

  openLogin(chainInfo?: { chainId: number }) {
    let query = `?dappOrigin=${window.location.origin}&dappName=${this.dappName}&dappIcon=${this.dappIconPath}`
    query = chainInfo ? `${query}&chainId=${chainInfo.chainId}` : query
    this.showIframe(this.walletUrl + '/#/sdk/email-login' + query)
  }

  openLogout() {
    let query = `?dappOrigin=${window.location.origin}`
    this.showIframe(this.walletUrl + '/#/sdk/logout' + query)
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

    this.showIframe(`${this.walletUrl}/#/sdk/sign-message/${type}/${messageToSign}?dappOrigin=${window.location.origin}`)
  }

  openSendTransaction(to: string, value: string, data: string) {
    if (!to || !value || !data || typeof to !== 'string' || typeof value !== 'string' || typeof data !== 'string') {
      return alert('Invalid txn input data')
    }
    this.showIframe(`${this.walletUrl}/#/sdk/send-transaction/${to}/${value}/${data}`)
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
      if (e.origin !== this.getOrigin() || e.data.type !== messageType) return

      sdkCallback()

      if (clientCallback) clientCallback(e.data)
    })
  }

  onAlreadyLoggedIn(callback: any) {
    this.onMessage('alreadyLoggedIn', () => this.hideIframe(), callback)
  }

  // ambire-login-success listener
  onLoginSuccess(callback: any) {
    this.onMessage('loginSuccess', () => this.hideIframe(), callback)
  }

  // ambire-registration-success listener
  onRegistrationSuccess(callback: any) {
    this.onMessage(
      'registrationSuccess',
      () => {
        this.iframe.src = this.walletUrl + '/#/sdk/on-ramp'
      },
      callback
    )

    this.onMessage('finishRamp', () => this.hideIframe())
  }

  onLogoutSuccess(callback: any) {
    this.onMessage('logoutSuccess', () => this.hideIframe(), callback)
  }

  onMsgRejected(callback: any) {
    this.onMessage('msgRejected', () => this.hideIframe(), callback)
  }

  onMsgSigned(callback: any) {
    this.onMessage('msgSigned', () => this.hideIframe(), callback)
  }

  onTxnRejected(callback: any) {
    this.onMessage('txnRejected', () => this.hideIframe(), callback)
  }

  onTxnSent(callback: any) {
    this.onMessage('txnSent', () => this.hideIframe(), callback)
  }

  onActionRejected(callback: any) {
    this.onMessage('actionRejected', () => this.hideIframe(), callback)
  }

  // the origin of this.walletUrl should be protocol://website.name without any additinal "/"
  // symbols at the end. Otherwise, messages do not pass. This code ensures the correct
  // origin is passed
  getOrigin() {
    return this.walletUrl.split('/').slice(0, 3).join('/')
  }
}

export { AmbireLoginSDK }
