const { pip_002_proto, ProcessMessage, IndentityKey } = require('../pip_node');

var grpc = require('@grpc/grpc-js');

function main() {
    var server = new grpc.Server();

    IndentityKey.InitRandomKey();
    
    server.addService(pip_002_proto.Handshake.service, {ProcessMessage: ProcessMessage});
    server.bindAsync('localhost:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
      if (err != null) {
        return console.error(err);
      }
      console.log(`gRPC listening on ${port}`)
    });
}
  
main();