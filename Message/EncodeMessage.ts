import { BaseEncoder } from "../utils";
import { MessageSchema } from "../pip_node";
import { IndentityKey } from "../pip_node";

export namespace EncodeMessage {

  export function encodeMessage(message: MessageSchema.Message): Buffer {
    const lengthPrefix = BaseEncoder.encodeUvarint(1);

    switch (message.type) {
      case MessageSchema.MessageType.HELLO_MESSAGE_TYPE: {
        return Buffer.concat([lengthPrefix, encodeHelloMessage(message)]);
      }
      case MessageSchema.MessageType.HELLO_ACK_MESSAGE_TYPE: {
        return Buffer.concat([lengthPrefix, encodeHelloAckMessage(message)]);
      }
    }
  }

  export function encodeMessageEnvelope({
    magic,
    type,
    timestamp,
    message,
    signature,
  }: MessageSchema.MessageEnvelope): Buffer {
    let buffer = Buffer.alloc(0);
    
    buffer = Buffer.concat([buffer, BaseEncoder.encodeUnit8(type)]);
    buffer = Buffer.concat([buffer, BaseEncoder.encodeUnit32(timestamp)]);
    buffer = Buffer.concat([buffer, encodeMessage(message)]);

    let hash_sig = IndentityKey.blake2b65(buffer);
    let sign_hash_sig = IndentityKey.KeyPair.sign(hash_sig);
    buffer = Buffer.concat([buffer, BaseEncoder.encodeArray<number>(sign_hash_sig, BaseEncoder.encodeUnit8)]);
    buffer = Buffer.concat([BaseEncoder.encodeUnit32(magic), buffer]);

    return buffer;
  }

  export function encodeHelloMessage({
    protocolVersion,
    localNonce,
    remoteNonce,
    publicKey,
    externalIp,
    externalPort,
    userAgent,
  }: MessageSchema.HelloMessage): Buffer {
    let buffer = Buffer.alloc(0);

    buffer = Buffer.concat([buffer, BaseEncoder.encodeUnit8(MessageSchema.MessageType.HELLO_MESSAGE_TYPE)]);
    buffer = Buffer.concat([buffer, BaseEncoder.encodeUnit32(protocolVersion)]);
    buffer = Buffer.concat([buffer, BaseEncoder.encodeArray<number>(localNonce, BaseEncoder.encodeUnit8)]);
    buffer = Buffer.concat([buffer, BaseEncoder.encodeArray<number>(remoteNonce, BaseEncoder.encodeUnit8)]);
    buffer = Buffer.concat([buffer, BaseEncoder.encodeArray<number>(publicKey, BaseEncoder.encodeUnit8)]);
    buffer = Buffer.concat([buffer, BaseEncoder.encodeArray<number>(externalIp, BaseEncoder.encodeUnit8)]);
    buffer = Buffer.concat([buffer, BaseEncoder.encodeUnit16(externalPort)]);
    buffer = Buffer.concat([buffer, BaseEncoder.encodeString(userAgent)]);
    
    return buffer;
  }

  export function encodeHelloAckMessage({ nonce }: MessageSchema.HelloAckMessage): any {
    let buffer = Buffer.alloc(0);

    buffer = Buffer.concat([buffer, BaseEncoder.encodeUnit8(MessageSchema.MessageType.HELLO_ACK_MESSAGE_TYPE)]);
    buffer = Buffer.concat([buffer,BaseEncoder.encodeArray<number>(nonce, BaseEncoder.encodeUnit8)]);

    return buffer;
  }
}
