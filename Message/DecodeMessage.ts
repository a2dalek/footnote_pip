import { BaseDecoder} from "../utils";
import { MessageSchema } from "../pip_node";
import { log } from "console";

export namespace DecodeMessage {

    export function decodeMessage(
        buffer: Buffer,
        type: MessageSchema.MessageType
    ): [MessageSchema.Message, Buffer] {
        let remainingBuffer: Buffer;
        let length: number;
        [length, remainingBuffer] = BaseDecoder.decodeUvarint(buffer);

        switch (type) {
            case MessageSchema.MessageType.HELLO_MESSAGE_TYPE: {
                return decodeHelloMessage(remainingBuffer);
            }

            case MessageSchema.MessageType.HELLO_ACK_MESSAGE_TYPE: {
                return decodeHelloAckMessage(remainingBuffer);
            }
        }
    }

    export function decodeEnvelopMessage(
        buffer: Buffer
    ): [MessageSchema.MessageEnvelope] {
        let remainingBuffer = buffer;

        let magic: number;
        let messageType: MessageSchema.MessageType;
        let timestamp: number;
        let message: MessageSchema.Message;
        let signature: number[];
    
        [magic, remainingBuffer] = BaseDecoder.decodeUnit32(remainingBuffer);
        [messageType, remainingBuffer] = BaseDecoder.decodeUnit8(remainingBuffer);
        [timestamp, remainingBuffer] = BaseDecoder.decodeUnit32(remainingBuffer);
        [message, remainingBuffer] = decodeMessage(remainingBuffer, messageType);
        [signature, remainingBuffer] = BaseDecoder.decodeArray<number>(remainingBuffer, 65, BaseDecoder.decodeUnit8);
        
        return [
            {
                magic: magic,
                type: messageType,
                timestamp: timestamp,
                message: message,
                signature: signature,
            },
        ];
    }

    export function decodeHelloMessage(buffer: Buffer): [MessageSchema.HelloMessage, Buffer] {
        let remainingBuffer = buffer;
      
        let protocolVersion: number;
        let localNonce: number[];
        let remoteNonce: number[];
        let publicKey: number[];
        let externalIp: number[];
        let externalPort: number;
        let userAgent: string;

        [protocolVersion, remainingBuffer] = BaseDecoder.decodeUnit32(remainingBuffer);
        [localNonce, remainingBuffer] = BaseDecoder.decodeArray<number>(remainingBuffer, 32, BaseDecoder.decodeUnit8);
        [remoteNonce, remainingBuffer] = BaseDecoder.decodeArray<number>(remainingBuffer, 32, BaseDecoder.decodeUnit8);
        [publicKey, remainingBuffer] = BaseDecoder.decodeArray<number>(remainingBuffer, 65, BaseDecoder.decodeUnit8);
        [externalIp, remainingBuffer] = BaseDecoder.decodeArray<number>(remainingBuffer, 16, BaseDecoder.decodeUnit8);
        [externalPort, remainingBuffer] = BaseDecoder.decodeUnit16(remainingBuffer);
        [userAgent, remainingBuffer] = BaseDecoder.decodeString(remainingBuffer);
        
        return [
          {
            type: MessageSchema.MessageType.HELLO_MESSAGE_TYPE,
            protocolVersion: protocolVersion,
            localNonce: localNonce,
            remoteNonce: remoteNonce,
            publicKey: publicKey,
            externalIp: externalIp,
            externalPort: externalPort,
            userAgent: userAgent,
          },
          remainingBuffer,
        ];
    }

    export function decodeHelloAckMessage(
        buffer: Buffer
    ): [MessageSchema.HelloAckMessage, Buffer] {
        const [nonce, remainingBuffer] = BaseDecoder.decodeArray<number>(buffer, 32, BaseDecoder.decodeUnit8);
        return [
            { 
                type: MessageSchema.MessageType.HELLO_ACK_MESSAGE_TYPE, 
                nonce: nonce,
            }, 
            remainingBuffer
        ];
    }
}
