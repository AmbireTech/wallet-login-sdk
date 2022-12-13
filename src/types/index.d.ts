export {}

declare global {
  interface Window {
    AmbireSDK: {
      new ({ walletUrl: string, dappName: string, chainID: number, iframeElementId: string }): AmbireSDK
      openLogin: any
    }
  }
}
