// // Handle grpc services of a node

// import { log } from "console";
// import { DecodeMessage } from "../Message/DecodeMessage";
// import { EncodeMessage } from "../Message/EncodeMessage";
// import { MessageSchema } from "../Message/MessageSchema";

// var PROTO_PATH = 'proto/pip_node.proto';

// var grpc = require('@grpc/grpc-js');
// var protoLoader = require('@grpc/proto-loader');
// var packageDefinition = protoLoader.loadSync(
//     PROTO_PATH,
//     {keepCase: true,
//      longs: String,
//      enums: String,
//      defaults: true,
//      oneofs: true
//     }
// );

// export var pip_002_proto = grpc.loadPackageDefinition(packageDefinition).pip_002;

// export function ProcessHelloMessage(call, callback) {
//   console.log(call.request);
//   let hello_message = DecodeMessage.decodeHelloMessage(call.request);

//   // TODO: Implement the real logic later
//   console.log(hello_message);
//   var test_hello_message : MessageSchema.HelloMessage = {
//     type: 0,
//     protocolVersion: 1,
//     localNonce: new Array(32).fill(5),
//     remoteNonce: new Array(32).fill(6),
//     publicKey: new Array(65).fill(7),
//     externalIp: new Array(16).fill(8),
//     externalPort: 200,
//     userAgent: "bob",
//   }

//   let encoded_message = EncodeMessage.encodeHelloMessage(test_hello_message);
//   callback(null, encoded_message);
// }

// // export function ProcessHelloAckMessage(call, callback) {
// //   let hello_ack_message = DecodeMessage.decodeHelloAckMessage(call.request);
// //   let encoded_message = EncodeMessage.encodeHelloAckMessage();
// //   callback(null, {
// //     encoded_message
// //   });
// // }

// import { IndentityKey,MessageSchema, EncodeMessage, DecodeMessage } from "./index";
// // import { IndentityKey } from "./IdentityKey";
// import { ec as EC } from "elliptic";

// const ec = new EC("secp256k1");

// // Alice's identity key pair
// let Alice_ik: EC.KeyPair;
// // Alice's nonce
// let Alice_nonce: Buffer;
// // Bob's identity key pair
// let Bob_ik: EC.KeyPair;
// // Bob's nonce
// let Bob_nonce: Buffer;

// export function initializeKeys() {
//   // Generate Alice's identity key pair
//   Alice_ik = IndentityKey.InitRandomKey();

//   // Generate Bob's identity key pair
//   Bob_ik = IndentityKey.InitRandomKey();

//   // Initialize nonces to zero
//   Alice_nonce = Buffer.alloc(32, 0);
//   Bob_nonce = Buffer.alloc(32, 0);
// }

// export function Handshake(isInitiator: boolean, remotePublicKey: Buffer) {
//   if (isInitiator) {
//     // Alice initiates the handshake with Bob
//     initiateHandshake(remotePublicKey);
//   } else {
//     // Bob receives the handshake initiation from Alice
//     respondToHandshake(remotePublicKey);
//   }
// }

// function initiateHandshake(remotePublicKey: Buffer) {
//   // 1. Alice generates a random 32-byte nonce Alice_nonce
//   Alice_nonce = Buffer.from(IndentityKey.RandomNonce());

//   // 2. Alice constructs a Hello message
//   const helloMessage: MessageSchema.HelloMessage = {
//     type: MessageSchema.MessageType.HELLO_MESSAGE_TYPE,
//     protocolVersion: 1,
//     localNonce: Array.from(Alice_nonce),
//     remoteNonce: Array.from(Buffer.alloc(32, 0)), // Set to all zeroes initially
//     publicKey: Array.from(Alice_ik.getPublic().toArray()),
//     externalIp: Array.from(Buffer.alloc(16, 0)), // Assume not Internet-accessible
//     externalPort: 0, // Assume not Internet-accessible
//     userAgent: "alice",
//   };

//   // 3. Alice generates a message envelope for the Hello message and signs it with Alice_ik
//   const encodedHelloMessage = EncodeMessage.encodeMessage(helloMessage);
//   const helloEnvelope: MessageSchema.MessageEnvelope = {
//     magic: 0xcafecafe,
//     timestamp: Date.now(),
//     message: helloMessage,
//     signature: Buffer.from(Alice_ik.sign(encodedHelloMessage).toArray()),
//   };

//   // 4. Alice sends the envelope to Bob
//   // TODO: Send the envelope (helloEnvelope) to Bob
//   console.log("Alice sent Hello message to Bob.");
// }

// function respondToHandshake(alicePublicKey: Buffer) {
//   // TODO: Receive and verify the Hello message from Alice
//   const helloEnvelope = /* Received Hello envelope */;

//   const [helloMessage] = DecodeMessage.decodeMessage(
//     helloEnvelope.message,
//     MessageSchema.MessageType.HELLO_MESSAGE_TYPE
//   );

//   // Verify the signature and nonce
//   const isValidSignature = ec.keyFromPublic(helloMessage.publicKey).verify(
//     EncodeMessage.encodeMessage(helloMessage),
//     helloEnvelope.signature
//   );

//   if (!isValidSignature) {
//     console.error("Invalid signature in Hello message from Alice.");
//     return;
//   }

//   if (!helloMessage.remoteNonce.every((value) => value === 0)) {
//     console.error("Invalid remote nonce in Hello message from Alice.");
//     return;
//   }

//   // Set Alice's nonce
//   Alice_nonce = Buffer.from(helloMessage.localNonce);

//   // 1. Bob generates a random 32-byte nonce Bob_nonce
//   Bob_nonce = Buffer.from(IndentityKey.RandomNonce());

//   // 2. Bob constructs a Hello message
//   const bobHelloMessage: MessageSchema.HelloMessage = {
//     type: MessageSchema.MessageType.HELLO_MESSAGE_TYPE,
//     protocolVersion: 1,
//     localNonce: Array.from(Bob_nonce),
//     remoteNonce: Array.from(Alice_nonce), // Set to the nonce received from Alice
//     publicKey: Array.from(Bob_ik.getPublic().toArray()),
//     externalIp: Array.from(Buffer.alloc(16, 0)), // Assume not Internet-accessible
//     externalPort: 0, // Assume not Internet-accessible
//     userAgent: "bob",
//   };

//   // 3. Bob generates a message envelope for the Hello message and signs it with Bob_ik
//   const encodedBobHelloMessage = EncodeMessage.encodeMessage(bobHelloMessage);
//   const bobHelloEnvelope: MessageSchema.MessageEnvelope = {
//     magic: 0xcafecafe,
//     timestamp: Date.now(),
//     message: bobHelloMessage,
//     signature: Buffer.from(Bob_ik.sign(encodedBobHelloMessage).toArray()),
//   };

//   // 4. Bob sends the envelope to Alice
//   // TODO: Send the envelope (bobHelloEnvelope) to Alice
//   console.log("Bob sent Hello message to Alice.");

//   // TODO: Receive and verify the HelloAck message from Alice
//   const helloAckEnvelope = /* Received HelloAck envelope */;

//   const [helloAckMessage] = DecodeMessage.decodeMessage(
//     helloAckEnvelope.message,
//     MessageSchema.MessageType.HELLO_ACK_MESSAGE_TYPE
//   );

//   // Verify the signature and nonces
//   const isValidHelloAckSignature = ec.keyFromPublic(alicePublicKey).verify(
//     EncodeMessage.encodeMessage(helloAckMessage),
//     helloAckEnvelope.signature
//   );

//   if (!isValidHelloAckSignature) {
//     console.error("Invalid signature in HelloAck message from Alice.");
//     return;
//   }

//   if (!helloAckMessage.localNonce.every((value, index) => value === Bob_nonce[index])) {
//     console.error("Invalid local nonce in HelloAck message from Alice.");
//     return;
//   }

//   if (!helloAckMessage.nonce.every((value, index) => value === Alice_nonce[index])) {
//     console.error("Invalid remote nonce in HelloAck message from Alice.");
//     return;
//   }

//   console.log("Handshake completed successfully.");
// }

import { MessageSchema,IndentityKey , EncodeMessage, DecodeMessage } from "./index";
// import { IndentityKey } from "./IdentityKey";
import { ec as EC } from "elliptic";

const ec = new EC("secp256k1");

// Alice's identity key pair
let Alice_ik: EC.KeyPair;
// Alice's nonce
let Alice_nonce: Buffer;
// Bob's identity key pair
let Bob_ik: EC.KeyPair;
// Bob's nonce
let Bob_nonce: Buffer;

export function initializeKeys() {
  // Generate Alice's identity key pair
  Alice_ik = IndentityKey.InitRandomKey();

  // Generate Bob's identity key pair
  Bob_ik = IndentityKey.InitRandomKey();

  // Initialize nonces to zero
  Alice_nonce = Buffer.alloc(32, 0);
  Bob_nonce = Buffer.alloc(32, 0);
}

export function Handshake(isInitiator: boolean, remotePublicKey: Buffer) {
  if (isInitiator) {
    // Alice initiates the handshake with Bob
    initiateHandshake(remotePublicKey);
  } else {
    // Bob receives the handshake initiation from Alice
    respondToHandshake(remotePublicKey);
  }
}

function initiateHandshake(remotePublicKey: Buffer) {
  // 1. Alice generates a random 32-byte nonce Alice_nonce
  Alice_nonce = Buffer.from(IndentityKey.RandomNonce());

  // 2. Alice constructs a Hello message
  const helloMessage: MessageSchema.HelloMessage = {
    type: MessageSchema.MessageType.HELLO_MESSAGE_TYPE,
    protocolVersion: 1,
    localNonce: Array.from(Alice_nonce),
    remoteNonce: Array.from(Buffer.alloc(32, 0)), // Set to all zeroes initially
    publicKey: Array.from(Alice_ik.getPublic().toArray()),
    externalIp: Array.from(Buffer.alloc(16, 0)), // Assume not Internet-accessible
    externalPort: 0, // Assume not Internet-accessible
    userAgent: "alice",
  };

  // 3. Alice generates a message envelope for the Hello message and signs it with Alice_ik
  const encodedHelloMessage = EncodeMessage.encodeMessage(helloMessage);
  const helloEnvelope: MessageSchema.MessageEnvelope = {
    magic: 0xcafecafe,
    timestamp: Date.now(),
    message: helloMessage,
    signature: Buffer.from(Alice_ik.sign(encodedHelloMessage).toArray()),
  };

  // 4. Alice sends the envelope to Bob
  // TODO: Send the envelope (helloEnvelope) to Bob
  console.log("Alice sent Hello message to Bob.");
}

function respondToHandshake(alicePublicKey: Buffer) {
  // Create a mock Hello envelope for testing
  const helloMessage: MessageSchema.HelloMessage = {
    type: MessageSchema.MessageType.HELLO_MESSAGE_TYPE,
    protocolVersion: 1,
    localNonce: Array.from(Alice_nonce),
    remoteNonce: Array.from(Buffer.alloc(32, 0)),
    publicKey: Array.from(alicePublicKey),
    externalIp: Array.from(Buffer.alloc(16, 0)),
    externalPort: 0,
    userAgent: "alice",
  };

  const encodedHelloMessage = EncodeMessage.encodeMessage(helloMessage);
  const helloEnvelope: MessageSchema.MessageEnvelope = {
    magic: 0xcafecafe,
    timestamp: Date.now(),
    message: helloMessage,
    signature: Buffer.from(Alice_ik.sign(encodedHelloMessage).toArray()),
  };

  const [decodedHelloMessage] = DecodeMessage.decodeMessage(
    helloEnvelope.message,
    MessageSchema.MessageType.HELLO_MESSAGE_TYPE
  );

  // Verify the signature and nonce
  const isValidSignature = ec.keyFromPublic(decodedHelloMessage.publicKey).verify(
    EncodeMessage.encodeMessage(decodedHelloMessage),
    helloEnvelope.signature
  );

  if (!isValidSignature) {
    console.error("Invalid signature in Hello message from Alice.");
    return;
  }

  if (!decodedHelloMessage.remoteNonce.every((value) => value === 0)) {
    console.error("Invalid remote nonce in Hello message from Alice.");
    return;
  }

  // Set Alice's nonce
  Alice_nonce = Buffer.from(decodedHelloMessage.localNonce);

  // 1. Bob generates a random 32-byte nonce Bob_nonce
  Bob_nonce = Buffer.from(IndentityKey.RandomNonce());

  // 2. Bob constructs a Hello message
  const bobHelloMessage: MessageSchema.HelloMessage = {
    type: MessageSchema.MessageType.HELLO_MESSAGE_TYPE,
    protocolVersion: 1,
    localNonce: Array.from(Bob_nonce),
    remoteNonce: Array.from(Alice_nonce), // Set to the nonce received from Alice
    publicKey: Array.from(Bob_ik.getPublic().toArray()),
    externalIp: Array.from(Buffer.alloc(16, 0)), // Assume not Internet-accessible
    externalPort: 0, // Assume not Internet-accessible
    userAgent: "bob",
  };

  // 3. Bob generates a message envelope for the Hello message and signs it with Bob_ik
  const encodedBobHelloMessage = EncodeMessage.encodeMessage(bobHelloMessage);
  const bobHelloEnvelope: MessageSchema.MessageEnvelope = {
    magic: 0xcafecafe,
    timestamp: Date.now(),
    message: bobHelloMessage,
    signature: Buffer.from(Bob_ik.sign(encodedBobHelloMessage).toArray()),
  };

  // 4. Bob sends the envelope to Alice
  // TODO: Send the envelope (bobHelloEnvelope) to Alice
  console.log("Bob sent Hello message to Alice.");

  // Create a mock HelloAck envelope for testing
  const helloAckMessage: MessageSchema.HelloAckMessage = {
    type: MessageSchema.MessageType.HELLO_ACK_MESSAGE_TYPE,
    publicKey: Array.from(Alice_ik.getPublic().toArray()),
    localNonce: Array.from(Bob_nonce),
    nonce:Array.from(Bob_nonce),
    remoteNonce: Array.from(Alice_nonce),
  };

  const encodedHelloAckMessage = EncodeMessage.encodeMessage(helloAckMessage);
  const helloAckEnvelope: MessageSchema.MessageEnvelope = {
    magic: 0xcafecafe,
    timestamp: Date.now(),
    message: helloAckMessage,
    signature: Buffer.from(Alice_ik.sign(encodedHelloAckMessage).toArray()),
  };

  const [decodedHelloAckMessage] = DecodeMessage.decodeMessage(
    helloAckEnvelope.message,
    MessageSchema.MessageType.HELLO_ACK_MESSAGE_TYPE
  );

  // Verify the signature and nonces
  const isValidHelloAckSignature = ec.keyFromPublic(alicePublicKey).verify(
    EncodeMessage.encodeMessage(decodedHelloAckMessage),
    helloAckEnvelope.signature
  );

  if (!isValidHelloAckSignature) {
    console.error("Invalid signature in HelloAck message from Alice.");
    return;
  }

  if (!helloAckMessage.nonce.every((value, index) => value === Alice_nonce[index])) {
    console.error("Invalid remote nonce in HelloAck message from Alice.");
    return;
  }

  console.log("Handshake completed successfully.");
}