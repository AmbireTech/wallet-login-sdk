export { sdkParamsType } from '@cmihaylov/core'

declare global {
  interface Window {
    AmbireLoginSDK: {
      new (sdkParamsType): AmbireLoginSDK
      // openLogin: any
    }
  }
}