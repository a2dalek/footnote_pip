import * as crypto from 'crypto';
import * as secp256k1 from 'secp256k1';

// Function to generate the secp256k1 signature
function generateBlobSignature(name: string, updateTimestamp: number, merkleRoot: Uint8Array, reserved: Uint8Array, privateKey: Uint8Array): Buffer {
    // Convert timestamp to little-endian byte buffer
    const timestampBuffer = Buffer.alloc(8);
    timestampBuffer.writeBigInt64LE(BigInt(updateTimestamp), 0);

    // Convert Uint8Arrays to Buffers
    const merkleRootBuffer = Buffer.from(merkleRoot);
    const reservedBuffer = Buffer.from(reserved);
    const privateKeyBuffer = Buffer.from(privateKey);

    // Concatenate the components
    const data = Buffer.concat([
        Buffer.from("DDRPBLOB", 'ascii'),
        Buffer.from(name, 'utf-8'),
        timestampBuffer,
        merkleRootBuffer,
        reservedBuffer
    ]);

    // Compute the hash
    const hashData = crypto.createHash('blake2b256').update(data).digest();

    // Generate the signature
    const signatureBuffer = secp256k1.ecdsaSign(hashData, privateKeyBuffer).signature;

    // Convert the Uint8Array signature to Buffer
    const signature = Buffer.from(signatureBuffer);

    return signature;
}

// Example usage
const name: string = "example_blob";
const updateTimestamp: number = 1648938662; // Example timestamp
const merkleRoot: Uint8Array = new Uint8Array(Buffer.from("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", 'hex')); // Example merkle root
const reserved: Uint8Array = new Uint8Array(Buffer.from("deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef", 'hex')); // Example reserved buffer
const privateKey: Uint8Array = new Uint8Array(Buffer.from("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", 'hex')); // Example private key

const signature: Buffer = generateBlobSignature(name, updateTimestamp, merkleRoot, reserved, privateKey);
console.log("Blob Signature:", signature.toString('hex'));
