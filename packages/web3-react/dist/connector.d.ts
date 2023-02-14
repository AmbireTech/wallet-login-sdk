import { Actions, Connector } from '@web3-react/types';
import { AmbireProvider } from './provider';
export declare class AmbireConnector extends Connector {
    _sdk: any;
    constructor(actions: Actions, options: any, onError?: (error: Error) => void);
    activate(chainInfo: any): Promise<void> | void;
    deactivate(): Promise<void> | void;
    getProvider(address: string, providerUrl: string): AmbireProvider;
}
