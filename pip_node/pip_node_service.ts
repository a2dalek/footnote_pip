// Handle grpc services of a node

import { log } from "console";
import { DecodeMessage } from "../Message/DecodeMessage";
import { EncodeMessage } from "../Message/EncodeMessage";
import { MessageSchema } from "../Message/MessageSchema";

var PROTO_PATH = 'proto/pip_node.proto';

var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    }
);

export var pip_002_proto = grpc.loadPackageDefinition(packageDefinition).pip_002;

export function ProcessHelloMessage(call, callback) {
  console.log(call.request);
  let hello_message = DecodeMessage.decodeHelloMessage(call.request);

  // TODO: Implement the real logic later
  console.log(hello_message);
  var test_hello_message : MessageSchema.HelloMessage = {
    type: 0,
    protocolVersion: 1,
    localNonce: new Array(32).fill(5),
    remoteNonce: new Array(32).fill(6),
    publicKey: new Array(65).fill(7),
    externalIp: new Array(16).fill(8),
    externalPort: 200,
    userAgent: "bob",
  }

  let encoded_message = EncodeMessage.encodeHelloMessage(test_hello_message);
  callback(null, encoded_message);
}

// export function ProcessHelloAckMessage(call, callback) {
//   let hello_ack_message = DecodeMessage.decodeHelloAckMessage(call.request);
//   let encoded_message = EncodeMessage.encodeHelloAckMessage();
//   callback(null, {
//     encoded_message
//   });
// }
