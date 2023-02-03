// declare module '../styles/main.css' {
//   export * from '../styles/main.css.d.ts'

//   const defaultExport: unknown
//   export default defaultExport
// }

declare type sdkParamsType = {
  walletUrl: string,
  dappName: string,
  dappIconPath?: string,
  chainID?: number,
  wrapperElementId?: string
}

declare global {
  interface Window {
    AmbireSDK: {
      new (sdkParamsType): AmbireSDK
      // openLogin: any
    }
  }
}

export {
  sdkParamsType
}
