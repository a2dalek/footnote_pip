import { BaseEncoder } from "../utils";
import { MessageSchema } from "../pip_002";

export namespace EncodeMessage {

  export function encodeMessage(message: MessageSchema.Message): Buffer {
    switch (message.type) {
      case MessageSchema.MessageType.HELLO_MESSAGE_TYPE: {
        return encodeHelloMessage(message);
      }
      case MessageSchema.MessageType.HELLO_ACK_MESSAGE_TYPE: {
        return encodeHelloAckMessage(message);
      }
    }
  }

  export function encodeHelloMessage({
    protocolVersion,
    localNonce,
    remoteNonce,
    publicKey,
    externalIp,
    externalPort,
    userAgent,
  }: MessageSchema.HelloMessage): any {
    return {
      type: BaseEncoder.encodeUnit8(0),
      protocol_version: BaseEncoder.encodeUnit32(protocolVersion),
      local_nonce: BaseEncoder.encodeArray<number>(localNonce, BaseEncoder.encodeUnit8),
      remote_nonce: BaseEncoder.encodeArray<number>(remoteNonce, BaseEncoder.encodeUnit8),
      public_key: BaseEncoder.encodeArray<number>(publicKey, BaseEncoder.encodeUnit8),
      external_ip: BaseEncoder.encodeArray<number>(externalIp, BaseEncoder.encodeUnit8),
      external_port: BaseEncoder.encodeUnit16(externalPort),
      user_agent: BaseEncoder.encodeString(userAgent),
    }
  }

  export function encodeHelloAckMessage({ nonce }: MessageSchema.HelloAckMessage): any {
    return {
      nonce: BaseEncoder.encodeArray<number>(nonce, BaseEncoder.encodeUnit8),
    }
  }

  // export function encodeMessageEnvelope({
  //   magic,
  //   timestamp,
  //   message,
  //   signature,
  // }: MessageEnvelope): Buffer {
  //   let buffer = Buffer.alloc(0);
  //   buffer = Buffer.concat([buffer, BaseEncoder.encodeUnit32(magic)]);
  //   buffer = Buffer.concat([buffer, BaseEncoder.encodeUnit8(message.type)]);
  //   buffer = Buffer.concat([buffer, BaseEncoder.encodeUnit32(timestamp)]);
  //   buffer = Buffer.concat([buffer, encodeMessage(message)]);
  //   buffer = Buffer.concat([buffer, BaseEncoder.encodeBuffer(signature)]);
  //   return buffer;
  // }

}