// Handle internal functions of a node, such as Handsake, ...

import { DecodeMessage, EncodeMessage, MessageSchema, IndentityKey } from "../pip_node"

export async function Handshake(client, external_ip, external_port) : Promise<Error> {
    IndentityKey.RandomNonce();

    var send_hello_message : MessageSchema.HelloMessage = {
      type: MessageSchema.MessageType.HELLO_MESSAGE_TYPE,
      protocolVersion: 2,
      localNonce: IndentityKey.Nonce,
      remoteNonce: Array.from(Buffer.alloc(32, 0)), // Init to 0
      publicKey: IndentityKey.PublicKey,
      externalIp: Array.from(external_ip),
      externalPort: external_port, 
      userAgent: IndentityKey.UserAgent,
    }
  
    var send_envelope_message: MessageSchema.MessageEnvelope = {
      magic: 0xcafecafe,
      type: MessageSchema.MessageType.HELLO_MESSAGE_TYPE,
      timestamp: Date.now(),
      message: send_hello_message,
      signature: [], // Signature will be calculate when encoding
    };
  
    var encoded_envelope_message = EncodeMessage.encodeMessageEnvelope(send_envelope_message);
  
    var [err, response] = await client.ProcessMessage(encoded_envelope_message);

    if (err) {
        console.log(err);
        return;
    }
    
    let recieve_envelope_message: MessageSchema.MessageEnvelope = DecodeMessage.decodeEnvelopMessage(response);
    console.log(recieve_envelope_message);

    let decoded_hello_message: MessageSchema.HelloMessage = recieve_envelope_message.message;

    const isValidSignature = IndentityKey.ec.keyFromPublic(decoded_hello_message.publicKey).verify(
        recieve_envelope_message.signature
    );

    if (!isValidSignature) {
        console.error("Invalid signature in Hello message.");
        return;
    }

    if (decoded_hello_message.protocolVersion != 2) {
        console.error("Invalid protocol version.");
        return;
    }

    if (decoded_hello_message.remoteNonce != IndentityKey.Nonce) {
        console.error("Different nonce");
        return;
    }

    var send_hello_ack_message : MessageSchema.HelloAckMessage = {
        type: MessageSchema.MessageType.HELLO_ACK_MESSAGE_TYPE,
        nonce: decoded_hello_message.localNonce,
    }

    send_envelope_message = {
        magic: 0xcafecafe,
        type: MessageSchema.MessageType.HELLO_MESSAGE_TYPE,
        timestamp: Date.now(),
        message: send_hello_ack_message,
        signature: [], // Signature will be calculate when encoding
    };

    var encoded_envelope_message = EncodeMessage.encodeMessageEnvelope(send_envelope_message);

    [err, response] = await client.ProcessMessage(encoded_envelope_message);
    
    if (err) {
        console.log(err);
        return;
    }

    return null;
}

export function HandleHelloMessage(recieve_envelope_message) : MessageSchema.MessageEnvelope {
    let nonce = IndentityKey.RandomNonce();

    let decoded_hello_message: MessageSchema.HelloMessage;
    decoded_hello_message = recieve_envelope_message.message;

    const isValidSignature = IndentityKey.ec.keyFromPublic(decoded_hello_message.publicKey).verify(
        recieve_envelope_message.signature
    );

    if (!isValidSignature) {
        console.error("Invalid signature in Hello message.");
        return null;
    }

    if (decoded_hello_message.protocolVersion != 2) {
        console.error("Invalid protocol version.");
        return null;
    }

    var send_hello_message : MessageSchema.HelloMessage = {
        type: MessageSchema.MessageType.HELLO_MESSAGE_TYPE,
        protocolVersion: 2,
        localNonce: IndentityKey.Nonce,
        remoteNonce: decoded_hello_message.localNonce, // Init to 0
        publicKey: IndentityKey.PublicKey,
        externalIp: Array.from(external_ip), // TODO: How to get IP of Alice
        externalPort: external_port, // TODO: How to get port of Alice
        userAgent: IndentityKey.UserAgent,
    }

    var send_envelope_message: MessageSchema.MessageEnvelope = {
        magic: 0xcafecafe,
        type: MessageSchema.MessageType.HELLO_MESSAGE_TYPE,
        timestamp: Date.now(),
        message: send_hello_message,
        signature: [], // Signature will be calculate when encoding
    };

    return send_envelope_message;
}

export function HandleHelloAckMessage(recieve_envelope_message) : MessageSchema.MessageEnvelope {
    let decoded_hello_ack_message: MessageSchema.HelloAckMessage;
    decoded_hello_ack_message = recieve_envelope_message.message;

    const isValidSignature = IndentityKey.ec.keyFromPublic(decoded_hello_ack_message.publicKey).verify(
        recieve_envelope_message.signature
    );

    if (!isValidSignature) {
        console.error("Invalid signature in Hello message from Alice.");
        return null;
    }

    if (decoded_hello_ack_message.nonce != IndentityKey.Nonce) {
        console.error("Different nonce");
        return;
    }
}
