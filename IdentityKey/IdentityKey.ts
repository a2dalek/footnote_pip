import { ec as EC } from 'elliptic';
import * as crypto from 'crypto';

const ec = new EC('secp256k1');

export namespace IndentityKey {
    export function RandomNonce() {
        const nonce = new Uint8Array(32);
        crypto.getRandomValues(nonce);

        return nonce;
    }
    
    export function InitRandomKey() : [any, number[], number[]] {
        const key_pair = ec.genKeyPair();
        const private_key = key_pair.getPrivate().toArray();
        const public_key = key_pair.getPublic().toArray();
    
        return [key_pair, public_key, private_key];
    }
}
