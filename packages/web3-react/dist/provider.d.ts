import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers';
import { ConnectionInfo } from "@ethersproject/web";
import { Networkish } from '@ethersproject/networks';
export declare class AmbireProvider extends JsonRpcProvider {
    _address: string;
    _sdk: any;
    constructor(sdk: any, address: string, url?: ConnectionInfo | string, network?: Networkish);
    getSigner(addressOrIndex?: string | number): JsonRpcSigner;
    handleMsgSign(type: string, args: any): Promise<unknown>;
}
