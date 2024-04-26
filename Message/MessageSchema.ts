export namespace MessageSchema {
  export enum MessageType {
    HELLO_MESSAGE_TYPE,
    HELLO_ACK_MESSAGE_TYPE,
  }

  export type HelloMessage = {
    type: MessageType.HELLO_MESSAGE_TYPE;
    protocolVersion: number;
    localNonce: number[];
    remoteNonce: number[];
    publicKey: number[];
    externalIp: number[];
    externalPort: number;
    userAgent: string;
  };

  export type HelloAckMessage = {
    type: MessageType.HELLO_ACK_MESSAGE_TYPE;
    publicKey: number[];
    localNonce: number[];
    nonce: number[];
    remoteNonce: number[];
  };

  export type Message = HelloMessage | HelloAckMessage;

  export type MessageEnvelope = {
    magic: number;
    // TODO: support Date
    timestamp: number;
    message: Message;
    // TODO: encrypt with signature
    signature: Buffer;
  };
}
  