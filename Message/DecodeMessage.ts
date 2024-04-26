import { BaseDecoder} from "../utils";
import { MessageSchema } from "../pip_node";
import { log } from "console";

export namespace DecodeMessage {

    export function decodeMessage(
        request: any,
        type: MessageSchema.MessageType
    ): [MessageSchema.Message] {
        switch (type) {
            case MessageSchema.MessageType.HELLO_MESSAGE_TYPE: {
                return decodeHelloMessage(request);
            }

            // case MessageSchema.MessageType.HELLO_ACK_MESSAGE_TYPE: {
            //     return decodeHelloAckMessage(request);
            // }
        }
    }

    export function decodeHelloMessage(request: any): [MessageSchema.HelloMessage] {
        let protocolVersion: number;
        let localNonce: number[];
        let remoteNonce: number[];
        let publicKey: number[];
        let externalIp: number[];
        let externalPort: number;
        let userAgent: string;

        protocolVersion = BaseDecoder.decodeUnit32(request.protocol_version); 
        localNonce = BaseDecoder.decodeArray<number>(request.local_nonce, 32, BaseDecoder.decodeUnit8);
        remoteNonce = BaseDecoder.decodeArray<number>(request.remote_nonce, 32, BaseDecoder.decodeUnit8);
        publicKey = BaseDecoder.decodeArray<number>(request.public_key, 65, BaseDecoder.decodeUnit8);
        externalIp = BaseDecoder.decodeArray<number>(request.external_ip, 16, BaseDecoder.decodeUnit8);
        externalPort = BaseDecoder.decodeUnit16(request.external_port); 
        userAgent = BaseDecoder.decodeString(request.user_agent);
        
        return [
            {
                type: MessageSchema.MessageType.HELLO_MESSAGE_TYPE,
                protocolVersion,
                localNonce,
                remoteNonce,
                publicKey,
                externalIp,
                externalPort,
                userAgent,
            },
        ];
    }

    // export function decodeHelloAckMessage(
    //     request: any
    // ): [MessageSchema.HelloAckMessage] {
    //     const [nonce,] = BaseDecoder.decodeArray<number>(request.remote_nonce, 32, BaseDecoder.decodeUnit8);

    //     return [
    //         {
    //             type: MessageSchema.MessageType.HELLO_ACK_MESSAGE_TYPE, 
    //             nonce,
    //         }
    //     ];
    // }

    // export function decodeMessageEnvelope(
    //     buffer: Buffer
    // ): [MessageEnvelope, Buffer] {
    //     let remainingBuffer = buffer;

    //     let magic: number;
    //     let messageType: MessageType;
    //     let timestamp: number;
    //     let message: Message;
    //     let signature: Buffer;
    //     [magic, remainingBuffer] = BaseDecoder.decodeUnit32(remainingBuffer);
    //     [messageType, remainingBuffer] = BaseDecoder.decodeUnit8(remainingBuffer);
    //     [timestamp, remainingBuffer] = BaseDecoder.decodeUnit32(remainingBuffer);
    //     [message, remainingBuffer] = decodeMessage(remainingBuffer, messageType);
    //     [signature, remainingBuffer] = BaseDecoder.decodeBuffer(remainingBuffer);
    //     return [
    //     {
    //         magic,
    //         timestamp,
    //         message,
    //         signature,
    //     },
    //     remainingBuffer,
    //     ];
    // }

}