import { ec as EC } from 'elliptic';
import * as crypto from 'crypto';
import { blake2b } from 'blakejs';

export namespace IndentityKey {
    export const ec = new EC('secp256k1');
    export var KeyPair: any;
    export var PrivateKey: any;
    export var PublicKey: any; 
    export var UserAgent: any;
    export var Nonce: any;

    export function RandomNonce() {
        const unit8_nonce = new Uint8Array(32);
        crypto.getRandomValues(unit8_nonce);
        Nonce = = Array.from(unit8_nonce);
    }
    
    export function InitRandomKey() {
        const KeyPair = ec.genKeyPair();
        const PrivateKey = KeyPair.getPrivate().toArray();
        const PublicKey = KeyPair.getPublic().toArray();
    }

    export function blake2b65(input: Buffer): any {
        // Generate the BLAKE2b hash with a 65-byte output
        const hash = blake2b(256, null, null, input);
      
        return hash;
    }

    export function set_user_agent(value) {
        UserAgent = value;
    }
}
