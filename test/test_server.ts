const { pip_002_proto, ProcessHelloMessage, ProcessHelloAckMessage } = require('../pip_002');

var grpc = require('@grpc/grpc-js');

function main() {
    var server = new grpc.Server();
    server.addService(pip_002_proto.Handshake.service, {ProcessHelloMessage: ProcessHelloMessage});
    server.bindAsync('localhost:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
      if (err != null) {
        return console.error(err);
      }
      console.log(`gRPC listening on ${port}`)
    });
}
  
main();