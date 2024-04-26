var grpc = require('@grpc/grpc-js');
import { DecodeMessage, EncodeMessage, pip_002_proto, MessageSchema } from "../pip_002"

function main() {
  var target = 'localhost:50051';
  var user = 'alice';

  var client = new pip_002_proto.Handshake(target, grpc.credentials.createInsecure());

  var test_hello_message : MessageSchema.HelloMessage = {
    type: 0,
    protocolVersion: 1,
    localNonce: new Array(32).fill(1),
    remoteNonce: new Array(32).fill(2),
    publicKey: new Array(65).fill(3),
    externalIp: new Array(16).fill(4),
    externalPort: 200,
    userAgent: 'alice',
  }

  client.ProcessHelloMessage(EncodeMessage.encodeHelloMessage(test_hello_message), function(err, response) {
    console.log(response);
    var response_message = DecodeMessage.decodeHelloMessage(response);
    console.log("Response message \n", response_message);
  });
}
  
main();