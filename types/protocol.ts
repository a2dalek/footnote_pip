import { BaseDecoder, BaseEncoder } from "../utils";
import { blake2b } from "blakejs";
import { ec as EC } from "elliptic";

export type MessageEnvelope = {
  timestamp: number;
  message: Message;
};

const PROTOCOL_MAGIC_NUMBER = 0xcafecafe;

export function encodeMessageEnvelope(
  { timestamp, message }: MessageEnvelope,
  keyPair: EC.KeyPair
): Buffer {
  let buffer = Buffer.alloc(0);
  buffer = Buffer.concat([
    buffer,
    BaseEncoder.encodeUnit32(PROTOCOL_MAGIC_NUMBER),
  ]);
  buffer = Buffer.concat([buffer, BaseEncoder.encodeUnit8(message.type)]);
  buffer = Buffer.concat([buffer, BaseEncoder.encodeUnit32(timestamp)]);
  buffer = Buffer.concat([buffer, encodeMessage(message)]);
  const data = Buffer.concat([
    BaseEncoder.encodeUnit8(message.type),
    BaseEncoder.encodeUnit32(timestamp),
    encodeMessage(message),
  ]);
  const dataHash = blake2b(data);
  const signedData = Buffer.from(keyPair.sign(dataHash).toDER("hex"), "hex");
  buffer = Buffer.concat([buffer, BaseEncoder.encodeBuffer(signedData)]);
  return buffer;
}
function getPubKeyFromMessage(message: Message): Buffer | null {
  if (message.type === MessageType.HELLO_MESSAGE_TYPE) {
    return message.publicKey;
  }
  return null;
}
export function decodeMessageEnvelope(
  buffer: Buffer,
  providePubkey: Buffer | null
): [MessageEnvelope, Buffer] {
  let remainingBuffer = buffer;

  let magic: number;
  let messageType: MessageType;
  let timestamp: number;
  let message: Message;
  let signature: Buffer;
  [magic, remainingBuffer] = BaseDecoder.decodeUnit32(remainingBuffer);
  if (magic !== PROTOCOL_MAGIC_NUMBER) {
    throw Error("Invalid magic number");
  }
  [messageType, remainingBuffer] = BaseDecoder.decodeUnit8(remainingBuffer);
  [timestamp, remainingBuffer] = BaseDecoder.decodeUnit32(remainingBuffer);
  [message, remainingBuffer] = decodeMessage(remainingBuffer, messageType);
  [signature, remainingBuffer] = BaseDecoder.decodeBuffer(remainingBuffer);
  const pubKey = providePubkey ?? getPubKeyFromMessage(message);
  if (pubKey !== null) {
    // verify signature
    const data = Buffer.concat([
      BaseEncoder.encodeUnit8(message.type),
      BaseEncoder.encodeUnit32(timestamp),
      encodeMessage(message),
    ]);
    const dataHash = blake2b(data);
    const ec = new EC("secp256k1");

    const isValid = ec.keyFromPublic(pubKey).verify(dataHash, signature);
    if (!isValid) {
      throw Error("Invalid sign");
    }
  }
  return [
    {
      timestamp,
      message,
    },
    remainingBuffer,
  ];
}

export enum MessageType {
  HELLO_MESSAGE_TYPE,
  HELLO_ACK_MESSAGE_TYPE,
}

export type Message = HelloMessage | HelloAckMessage;
export function encodeMessage(message: Message): Buffer {
  switch (message.type) {
    case MessageType.HELLO_MESSAGE_TYPE: {
      return encodeHelloMessage(message);
    }
    case MessageType.HELLO_ACK_MESSAGE_TYPE: {
      return encodeHelloAckMessage(message);
    }
  }
}
export function decodeMessage(
  buffer: Buffer,
  type: MessageType
): [Message, Buffer] {
  switch (type) {
    case MessageType.HELLO_MESSAGE_TYPE: {
      return decodeHelloMessage(buffer);
    }
    case MessageType.HELLO_ACK_MESSAGE_TYPE: {
      return decodeHelloAckMessage(buffer);
    }
  }
}

export type HelloMessage = {
  type: MessageType.HELLO_MESSAGE_TYPE;
  protocolVersion: number;
  localNonce: Buffer;
  remoteNonce: Buffer;
  publicKey: Buffer;
  externalIp: Buffer;
  externalPort: number;
  userAgent: string;
};

export function encodeHelloMessage({
  protocolVersion,
  localNonce,
  remoteNonce,
  publicKey,
  externalIp,
  externalPort,
  userAgent,
}: HelloMessage): Buffer {
  let buffer = Buffer.alloc(0);
  buffer = Buffer.concat([buffer, BaseEncoder.encodeUnit32(protocolVersion)]);
  buffer = Buffer.concat([buffer, BaseEncoder.encodeBuffer(localNonce)]);
  buffer = Buffer.concat([buffer, BaseEncoder.encodeBuffer(remoteNonce)]);
  buffer = Buffer.concat([buffer, BaseEncoder.encodeBuffer(publicKey)]);
  buffer = Buffer.concat([buffer, BaseEncoder.encodeBuffer(externalIp)]);
  buffer = Buffer.concat([buffer, BaseEncoder.encodeUnit16(externalPort)]);
  buffer = Buffer.concat([buffer, BaseEncoder.encodeString(userAgent)]);
  return buffer;
}

export function decodeHelloMessage(buffer: Buffer): [HelloMessage, Buffer] {
  let remainingBuffer = buffer;

  let protocolVersion: number;
  let localNonce: Buffer;
  let remoteNonce: Buffer;
  let publicKey: Buffer;
  let externalIp: Buffer;
  let externalPort: number;
  let userAgent: string;
  [protocolVersion, remainingBuffer] =
    BaseDecoder.decodeUnit32(remainingBuffer);
  if (protocolVersion !== 2) {
    throw Error("Invalid protcol version");
  }
  [localNonce, remainingBuffer] = BaseDecoder.decodeBuffer(remainingBuffer);
  [remoteNonce, remainingBuffer] = BaseDecoder.decodeBuffer(remainingBuffer);
  [publicKey, remainingBuffer] = BaseDecoder.decodeBuffer(remainingBuffer);
  [externalIp, remainingBuffer] = BaseDecoder.decodeBuffer(remainingBuffer);
  [externalPort, remainingBuffer] = BaseDecoder.decodeUnit16(remainingBuffer);
  [userAgent, remainingBuffer] = BaseDecoder.decodeString(remainingBuffer);
  return [
    {
      type: MessageType.HELLO_MESSAGE_TYPE,
      protocolVersion,
      localNonce,
      remoteNonce,
      publicKey,
      externalIp,
      externalPort,
      userAgent,
    },
    remainingBuffer,
  ];
}

export type HelloAckMessage = {
  type: MessageType.HELLO_ACK_MESSAGE_TYPE;
  nonce: Buffer;
};

export function encodeHelloAckMessage({ nonce }: HelloAckMessage): Buffer {
  return BaseEncoder.encodeBuffer(nonce);
}

export function decodeHelloAckMessage(
  buffer: Buffer
): [HelloAckMessage, Buffer] {
  const [nonce, remainingBuffer] = BaseDecoder.decodeBuffer(buffer);
  return [{ type: MessageType.HELLO_ACK_MESSAGE_TYPE, nonce }, remainingBuffer];
}
