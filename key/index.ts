import { ec as EC } from "elliptic";
import * as crypto from "crypto";
import { blake2b } from "blakejs";

export namespace CryptoGraphy {
  export const ec = new EC("secp256k1");

  //random Buffer 32 Bytes
  export function randomNonce(): Buffer {
    return crypto.randomBytes(32);
  }

  export function InitRandomKey(): EC.KeyPair {
    const keyPair = ec.genKeyPair();
    return keyPair;
  }

  // export function blake2b65(input: Buffer, privKey: Buffer): Buffer {
  //   // Generate the BLAKE2b hash with a 65-byte output
  //   const hash = blake2b(input, privKey, 256);

  //   return Buffer.from(Array.from(hash));
  // }
}
