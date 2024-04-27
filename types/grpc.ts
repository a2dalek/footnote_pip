import * as grpcProtoLoader from "@grpc/proto-loader";
import * as grpc from "grpc";

const PROTO_PATH = "hihi/hihi.proto";

const packageDefinition = grpcProtoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
export const protocolService = protoDescriptor["Hihi"]["service"];
