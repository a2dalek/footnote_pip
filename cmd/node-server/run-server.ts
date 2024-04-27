import { Server } from "./server";
import * as protoLoader from "@grpc/proto-loader";
import * as grpc from "grpc";
import { User, getHost, localUser } from "../../config";

const PROTO_PATH = "hihi/hihi.proto";

// Load the protobuf
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Load the service definition
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const hihiService = protoDescriptor["Hihi"] as any;
function main(): void {
  const server = new Server(hihiService);
  if (localUser === User.ALICE) {
    server.handShake(getHost(User.BOB));
  }
}

main();
