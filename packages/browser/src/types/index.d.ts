export { sdkParamsType } from '@ambire/login-sdk-core'

declare global {
  interface Window {
    AmbireLoginSDK: {
      new (sdkParamsType): AmbireLoginSDK
    }
  }
}