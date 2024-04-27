import { ec as EC } from "elliptic";

const ec = new EC("secp256k1");

console.log(ec.genKeyPair().getPrivate("hex").length);
