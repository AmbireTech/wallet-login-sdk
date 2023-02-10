import { Actions, Connector } from '@web3-react/types';
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { ConnectionInfo } from "@ethersproject/web";
import { Networkish } from '@ethersproject/networks';
export declare class AmbireWallet extends Connector {
    _sdk: any;
    constructor(actions: Actions, options: any, onError?: (error: Error) => void);
    activate(chainInfo: any): Promise<void> | void;
    deactivate(): Promise<void> | void;
    getProvider(address: string, providerUrl: string): AmbireProvider;
}
declare class AmbireProvider extends JsonRpcProvider {
    _address: string;
    _sdk: any;
    constructor(sdk: any, address: string, url?: ConnectionInfo | string, network?: Networkish);
    getSigner(addressOrIndex?: string | number): JsonRpcSigner;
    handleMsgSign(type: string, args: any): Promise<unknown>;
}
export {};
