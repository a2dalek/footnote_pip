var grpc = require('@grpc/grpc-js');
import { Handshake } from "../pip_node/pip_node_internal";

function main() {
  var target = 'localhost:50051';
  var user = 'alice';

  var client = new pip_002_proto.Handshake(target, grpc.credentials.createInsecure());
  IndentityKey.InitRandomKey();

  Handshake();
}
  
main();