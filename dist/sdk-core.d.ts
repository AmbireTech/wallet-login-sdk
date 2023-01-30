import { sdkParamsType } from './types/index';
declare class AmbireLoginSDK {
    walletUrl: string;
    dappName: string;
    dappIconPath: string;
    wrapperElementId: string;
    wrapperElement: any;
    iframe: any;
    constructor(opt: sdkParamsType);
    initSdkWrapperDiv(id?: string): void;
    hideIframe(): void;
    showIframe(url: string): void;
    openLogin(chainInfo?: {
        chainId: number;
    }): void;
    openLogout(): void;
    openSignMessage(type: string, messageToSign: string): void;
    openSendTransaction(to: string, value: string, data: string): void;
    emit(eventName: string, data?: {}): void;
    on(eventName: string, callback: any): void;
    onMessage(messageType: string, sdkCallback: any, clientCallback?: any): void;
    onAlreadyLoggedIn(callback: any): void;
    onLoginSuccess(callback: any): void;
    onRegistrationSuccess(callback: any): void;
    onLogoutSuccess(callback: any): void;
    onMsgRejected(callback: any): void;
    onMsgSigned(callback: any): void;
    onTxnRejected(callback: any): void;
    onTxnSent(callback: any): void;
    onActionRejected(callback: any): void;
    getOrigin(): string;
}
export { AmbireLoginSDK };
