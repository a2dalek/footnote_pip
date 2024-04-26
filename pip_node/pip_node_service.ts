// Handle grpc services of a node

import { log } from "console";
import { DecodeMessage } from "../Message/DecodeMessage";
import { EncodeMessage } from "../Message/EncodeMessage";
import { MessageSchema } from "../Message/MessageSchema";
import { HandleHelloMessage, HandleHelloAckMessage} from "./pip_node_internal";

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

export function ProcessMessage(call, callback) {
  let envelope_message: MessageSchema.MessageEnvelope;
  envelope_message = DecodeMessage.decodeEnvelopMessage(call.request);
  console.log(envelope_message);

  var response_message : MessageSchema.MessageEnvelope;
  if (envelope_message.type == MessageSchema.MessageType.HELLO_MESSAGE_TYPE) {
    response_message = HandleHelloMessage(envelope_message);
  } else if (envelope_message.type == MessageSchema.MessageType.HELLO_ACK_MESSAGE_TYPE) {
    response_message = HandleHelloAckMessage(envelope_message);
  }

  var encoded_response_message = EncodeMessage.encodeMessageEnvelope(response_message);

  callback(null, encoded_response_message);
}
