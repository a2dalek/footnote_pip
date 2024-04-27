import * as grpc from "grpc";
import { getHost, getIP, getPort } from "../../config";
import {
  HelloAckMessage,
  HelloMessage,
  MessageEnvelope,
  MessageType,
  decodeMessageEnvelope,
  encodeMessageEnvelope,
  protocolService,
} from "../../types";
import * as crypto from "crypto";
import { ec as EC } from "elliptic";
const ec = new EC("secp256k1");
const keyPair = ec.genKeyPair();
const localNonce = crypto.randomBytes(32);

export class Server {
  readonly clientCreator: any;
  readonly server: grpc.Server;
  readonly handShakeList: Set<string>;
  constructor(clientCreator: any) {
    this.clientCreator = clientCreator;
    this.handShakeList = new Set<string>();
    this.server = new grpc.Server();
    this.server.addService(protocolService, { sayHi: this.handleHelloMessage });
    this.server.bindAsync(
      getHost(),
      grpc.ServerCredentials.createInsecure(),
      (err, port) => {
        if (err) {
          console.error("Server bind failed:", err);
          return;
        }
        console.log(port);
        console.log(`Server is listening on 127.0.0.1:${port}`);
        this.server.start();
      }
    );
  }

  handleHelloMessage(
    call: grpc.ServerUnaryCall<any>,
    callback: grpc.sendUnaryData<any>
  ): void {
    const blob = call.request.blob;
    const [messageEnvelope, remainingBuffer] = decodeMessageEnvelope(
      blob,
      null
    );
    if (remainingBuffer.length !== 0) {
      throw Error("Invalid message type");
    }

    const message = messageEnvelope.message;
    switch (message.type) {
      case MessageType.HELLO_MESSAGE_TYPE: {
        console.log(
          "Take Message from Alice Success Request:",
          JSON.stringify(message)
        );

        const responceMessage: HelloMessage = {
          type: MessageType.HELLO_MESSAGE_TYPE,
          protocolVersion: 2,
          localNonce: localNonce,
          remoteNonce: message.localNonce, // Init to 0
          publicKey: Buffer.from(keyPair.getPublic("hex"), "hex"),
          externalIp: Buffer.from(getIP(), "utf-8"),
          externalPort: getPort(),
          userAgent: "Hihi",
        };
        const response = {
          blob: encodeMessageEnvelope(
            {
              message: responceMessage,
              timestamp: Math.floor(Date.now() / 1000),
            },
            keyPair
          ),
        };
        callback(null, response);
      }
      case MessageType.HELLO_ACK_MESSAGE_TYPE: {
        // TODO: handle
        // console.log(
        //   "Request:",
        //   JSON.stringify(decodeMessageEnvelope(blob, null))
        // );
        // const response = {
        //   blob: encodeMessageEnvelope(messageEnvelope, keyPair),
        // };
        // callback(null, { blob: Buffer.from("Hihih", "utf8") });
        console.log("TODO: hihi");
      }
    }
  }

  async handShake(partnerHost: string): Promise<void> {
    const helloMessage: HelloMessage = {
      type: MessageType.HELLO_MESSAGE_TYPE,
      protocolVersion: 2,
      localNonce: localNonce,
      remoteNonce: Buffer.alloc(32, 0), // Init to 0
      publicKey: Buffer.from(keyPair.getPublic("hex"), "hex"),
      externalIp: Buffer.from(getIP(), "utf-8"),
      externalPort: getPort(),
      userAgent: "Hihi",
    };

    const envelopeMessage: MessageEnvelope = {
      timestamp: Math.floor(Date.now() / 1000),
      message: helloMessage,
    };
    const blob = encodeMessageEnvelope(envelopeMessage, keyPair);
    const client = new this.clientCreator(
      partnerHost,
      grpc.credentials.createInsecure()
    );
    const response: any = await new Promise((resolve, reject) => {
      const call = client.sayHi({ blob }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
    const [messageEnvelope, remainingBuffer] = decodeMessageEnvelope(
      response.blob,
      null
    );
    if (messageEnvelope.message.type !== MessageType.HELLO_MESSAGE_TYPE) {
      throw Error("invalid message");
    }
    console.log("receive success from BOB 1");

    const helloAckMessage: HelloAckMessage = {
      type: MessageType.HELLO_ACK_MESSAGE_TYPE,
      nonce: localNonce,
    };

    const envelopeMessage2: MessageEnvelope = {
      timestamp: Math.floor(Date.now() / 1000),
      message: helloMessage,
    };
    const blob2 = encodeMessageEnvelope(envelopeMessage2, keyPair);
    const response2: any = await new Promise((resolve, reject) => {
      const call = client.sayHi({ blob }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
    console.log("receive success from BOB 2");
  }
}
