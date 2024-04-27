import * as crypto from 'crypto';
import * as secp256k1 from 'secp256k1';

export const BLOB_SIZE = 16 * 1024 * 1024; // 16 MiB
export const SECTOR_SIZE = 64 * 1024; // 64 KiB

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
export class Blob {
    private data: Uint8Array;
    private name: string;
    private owner: string;
    private updateTimestamp: number;
    private merkleRoot: Uint8Array;
    private reserved: Uint8Array;

    constructor(name: string, owner: string) {
        // ... (implementation omitted for brevity)
    }
    getMerkleRoot(): Uint8Array {
        return this.merkleRoot;
    }

    private computeMerkleRoot(): Uint8Array {
        // Implement Merkle tree computation logic here
        // Return the Merkle root as a Uint8Array
        return new Uint8Array(32);
    }

    computeSectorHash(sectorId: number): Uint8Array {
        // Implement logic to compute the hash of a sector
        // Return the sector hash as a Uint8Array
        return new Uint8Array(32);
    }

    read(offset: number, length: number): Uint8Array {
        return new Uint8Array(32);
    }

    write(offset: number, data: Uint8Array): void {
        // ... (implementation omitted for brevity)
    }

    getSignature(privateKey: Uint8Array): Buffer {
        return generateBlobSignature(this.name, this.updateTimestamp, this.merkleRoot, this.reserved, privateKey);
    }
}

export function areUint8ArraysEqual(arr1: Uint8Array, arr2: Uint8Array): boolean {
    if (arr1.length !== arr2.length) {
        return false;
    }

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    return true;
}
// DDRP Node
class DDRPNode {
    private blobs: Map<string, Blob>;
    private peers: Map<string, DDRPNode>;

    constructor() {
        this.blobs = new Map();
        this.peers = new Map();
    }

    addPeer(peer: DDRPNode): void {
        // Add peer logic
    }

    removePeer(peer: DDRPNode): void {
        // Remove peer logic
    }

    initialSync(): void {
        // ... (implementation omitted for brevity)
    }

    sendUpdateReq(name: string): void {
        // ... (implementation omitted for brevity)
    }

    handleUpdateMessage(message: any): void {
        // ... (implementation omitted for brevity)
    }

    sendTreeBaseReq(name: string): void {
        // ... (implementation omitted for brevity)
    }

    handleTreeBaseRes(message: any): void {
        const blobData = this.blobs.get(message.data.name);
        if (blobData && areUint8ArraysEqual(blobData.getMerkleRoot(), message.data.merkle_root)) {
            const treeBase = message.data.tree_base;
            for (let i = 0; i < treeBase.length; i++) {
                const sectorHash = treeBase[i];
                const expectedSectorHash = blobData.computeSectorHash(i);
                if (!areUint8ArraysEqual(sectorHash, expectedSectorHash)) {
                    this.sendSectorReq(message.data.name, i);
                }
            }
        }
    }
    sendSectorReq(name: string, sectorId: number): void {
        // Construct and send SectorReq message
        const message = {
            type: 0x07,
            data: {
                name: name,
                sector_id: sectorId
            }
        };
        // Send message to peers
        for (const peer of this.peers.values()) {
            peer.handleSectorReq(message);
        }
    }

    handleSectorReq(message: any): void {
        const blobData = this.blobs.get(message.data.name);
        if (blobData) {
            const sectorId = message.data.sector_id;
            const offset = sectorId * SECTOR_SIZE;
            const sectorData = blobData.read(offset, SECTOR_SIZE);
            this.sendSectorRes(message.data.name, sectorId, sectorData);
        }
    }

    sendSectorRes(name: string, sectorId: number, sectorData: Uint8Array): void {
        // Construct and send SectorRes message
        const message = {
            type: 0x08,
            data: {
                name: name,
                sector_id: sectorId,
                sector: sectorData
            }
        };
        // Send message to peers
        for (const peer of this.peers.values()) {
            peer.handleSectorRes(message);
        }
    }

    handleSectorRes(message: any): void {
        // Verify sector data against tree_base
        const blobData = this.blobs.get(message.data.name);
        if (blobData) {
            const sectorId = message.data.sector_id;
            const offset = sectorId * SECTOR_SIZE;
            const sectorData = message.data.sector;
            blobData.write(offset, sectorData);
        }
    }

    // Other methods for handling different message types, updating blobs, etc.
}

// Example usage
const node = new DDRPNode();
node.initialSync();

// Handle incoming messages from peers
const updateMessage = {
    type: 0x04,
    data: {
        name: 'example.com',
        timestamp: 1648938662,
        merkle_root: new Uint8Array(32),
        reserved: new Uint8Array(32),
        signature: Buffer.from('...', 'hex')
    }
};
node.handleUpdateMessage(updateMessage);