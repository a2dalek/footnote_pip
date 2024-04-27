import * as grpc from "@grpc/grpc-js";
import { getHost, getIP, getPort } from "../../config";
import { blake2b } from "blakejs";

import {
  HelloAckMessage,
  HelloMessage,
  MessageEnvelope,
  MessageType,
  PeerObject,
  PeerReqMessage,
  PeerResMessage,
  PingMessage,
  decodeMessageEnvelope,
  encodeMessageEnvelope,
  protocolService,
} from "../../types";
import * as crypto from "crypto";
import { ec as EC } from "elliptic";
const ec = new EC("secp256k1");
const keyPair = ec.genKeyPair();
const localNonce = crypto.randomBytes(32);

export type PeerInfo = {
  Ip: any,
  port: any,
  last_ping_time: any,
  public_key: any,
  connecting: boolean,
}

var map_peer = new Map<any, PeerInfo>();
var map_nonce_peer = new Map<any, PeerInfo>();
var map_fake_port = new Map<string, string>();
var num_peer = 0;

export class Server {
  readonly clientCreator: any;
  readonly server: grpc.Server;
  readonly handShakeList: Set<string>;
  readonly client_list: any;
  constructor(clientCreator: any) {
    this.clientCreator = clientCreator;
    this.handShakeList = new Set<string>();
    this.server = new grpc.Server();
    this.server.addService(protocolService, { sayHi: this.handleHelloMessage });
    this.client_list = new Map<string, any>();
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

    const sender_peer_address = call.getPeer(); 

    const message = messageEnvelope.message;
    switch (message.type) {
      case MessageType.HELLO_MESSAGE_TYPE: {
        console.log(
          "Take Hello Message from new peer Success"
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

        map_nonce_peer.set(sender_peer_address, {
          Ip: (message.externalIp).toString('utf-8'),
          port: (message.externalPort).toString(),
          last_ping_time: Date.now() / 1000,
          public_key: message.publicKey,
          connecting: false,
        });

        map_fake_port.set(sender_peer_address, (message.externalIp).toString('utf-8') + ":" + (message.externalPort).toString());

        callback(null, response);
        break;
      }

      case MessageType.HELLO_ACK_MESSAGE_TYPE: {
        console.log(
          "Take Hello Ack Message from new peer Success"
        );

        var sender_address = map_nonce_peer.get(sender_peer_address).Ip + ":" + map_nonce_peer.get(sender_peer_address).port;
        map_peer.set(sender_address, map_nonce_peer.get(sender_peer_address));
        map_peer.get(sender_address).connecting = true;
        map_peer.get(sender_address).last_ping_time = Date.now() / 1000;

        num_peer = num_peer + 1;
        
        const responceMessage: HelloAckMessage = {
          type: MessageType.HELLO_ACK_MESSAGE_TYPE,
          nonce: localNonce,
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
        break;
      }

      case MessageType.PING_MESSAGE: {
        var Ip = (message.externalIp).toString('utf-8');
        var port = (message.externalPort).toString();

        console.log("Ping from ", Ip + ":" + port);
        let cur_time = Date.now() / 1000;
        if (cur_time - map_peer.get(Ip + ":" + port).last_ping_time > 30) {
          if (map_peer.get(Ip + ":" + port).connecting == true) {
            map_peer.get(Ip + ":" + port).connecting = false;
            num_peer = num_peer - 1;
            console.log("Disconnect ", Ip + ":" + port);
          }
        } else {
          map_peer.get(Ip + ":" + port).last_ping_time = cur_time;
        }

        break;
      }

      case MessageType.PEER_REQ_MESSAGE_TYPE: {
        var num = 0;
        var peer_list_res: PeerObject[] = [];
        for (var [key, value] of map_peer.entries()) {
          if (value.connecting == true) {
            num = num + 1;
            peer_list_res.push({
              ip: Buffer.from(value.Ip, "utf-8"),
              port: parseInt(value.port, 10),
            });
          }
        };

        const responceMessage: PeerResMessage = {
          type: MessageType.PEER_RES_MESSAGE_TYPE,
          peer_count: num,
          peers: peer_list_res,
        };

        console.log(responceMessage);

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
        break;
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

    var client: any;
    if (this.client_list.has(partnerHost)) {
      client = this.client_list.get(partnerHost);
    } else {
      this.client_list.set(partnerHost, new this.clientCreator(
        partnerHost,
        grpc.credentials.createInsecure()
      ));
      client = this.client_list.get(partnerHost);
    }
  
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
    console.log("receive response hello message success from node");

    const helloAckMessage: HelloAckMessage = {
      type: MessageType.HELLO_ACK_MESSAGE_TYPE,
      nonce: localNonce,
    };

    const envelopeMessage2: MessageEnvelope = {
      timestamp: Math.floor(Date.now() / 1000),
      message: helloAckMessage,
    };

    const blob2 = encodeMessageEnvelope(envelopeMessage2, keyPair);
    const response2: any = await new Promise((resolve, reject) => {
      const call = client.sayHi({ blob: blob2 }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
    console.log("Connect successfully");

    map_peer.set(partnerHost, {
      Ip: (messageEnvelope.message.externalIp).toString('utf-8'),
      port: (messageEnvelope.message.externalPort).toString(),
      last_ping_time: Date.now() / 1000,
      public_key: messageEnvelope.message.publicKey,
      connecting: true,
    });

    num_peer = num_peer + 1;
  }

  async pingPeer(partnerHost: string) {
    const pingMessage: PingMessage = {
      type: MessageType.PING_MESSAGE,
      externalIp: Buffer.from(getIP(), "utf-8"),
      externalPort: getPort(),
    };

    const envelopeMessage: MessageEnvelope = {
      timestamp: Math.floor(Date.now() / 1000),
      message: pingMessage,
    };
    const blob = encodeMessageEnvelope(envelopeMessage, keyPair);

    var client: any;
    if (this.client_list.has(partnerHost)) {
      client = this.client_list.get(partnerHost);
    } else {
      this.client_list.set(partnerHost, new this.clientCreator(
        partnerHost,
        grpc.credentials.createInsecure()
      ));
      client = this.client_list.get(partnerHost);
    }

    const response: any = await new Promise((resolve, reject) => {
      const call = client.sayHi({ blob }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  PingAllPeer() : any {
    let cur_time = Date.now() / 1000;

    for (var [key, value] of map_peer.entries()) {
      if (cur_time - value.last_ping_time > 30) {
        if (value.connecting == true) {
          value.connecting = false;
          console.log("Disconect peer ", value.Ip, ":", value.port);
          num_peer = num_peer - 1;
        }
      }
      
      if (value.connecting == true) {
        console.log("Ping to ",value.Ip + ":" + value.port);
        this.pingPeer(value.Ip + ":" + value.port);
      }
    };
  }

  async PeerReq(partnerHost) {
    const PeerReqMessage: PeerReqMessage = {
      type: MessageType.PEER_REQ_MESSAGE_TYPE,
    };

    const envelopeMessage: MessageEnvelope = {
      timestamp: Math.floor(Date.now() / 1000),
      message: PeerReqMessage,
    };
    const blob = encodeMessageEnvelope(envelopeMessage, keyPair);

    var client: any;
    if (this.client_list.has(partnerHost)) {
      client = this.client_list.get(partnerHost);
    } else {
      this.client_list.set(partnerHost, new this.clientCreator(
        partnerHost,
        grpc.credentials.createInsecure()
      ));
      client = this.client_list.get(partnerHost);
    }
  
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

    const peer_count : number = messageEnvelope.message.peer_count;
    const peers : PeerObject[] = messageEnvelope.message.peers;
    console.log(messageEnvelope.message);
    for (var [key, peer] of peers.entries()) {
      console.log(peer);
      var ip = (peer.ip).toString('utf-8');
      var port = (peer.port).toString();
      var address = ip + ":" + port;
      console.log(address)
      if (map_peer.has(address) && map_peer.get(address).connecting == true) {
        continue;
      }

      console.log("Connect to new peer ", ip + ":" + port);
      this.handShake(ip + ":" + port);
      if (num_peer >= 8) {
        break;
      }
    }
  }

  PeerDiscovery() {
    console.log("peer discovery, current number of peers: ", num_peer);
    if (num_peer >= 8) {
      return;
    }
    for (var [key, value] of map_peer.entries()) {
      if (value.connecting == true) {
        console.log("Send peer request to ",value.Ip + ":" + value.port);
        this.PeerReq(value.Ip + ":" + value.port);
      }
    };
  }

  startPinging() {
    // Use an arrow function to retain `this` context
    const intervalId1 = setInterval(() => this.PingAllPeer(), 5000);
  }

  startPeerDiscovery() {
    // Use an arrow function to retain `this` context
    const intervalId2 = setInterval(() => this.PeerDiscovery(), 5000);
  }
}
