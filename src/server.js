import express from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import {
  badRequestHandler,
  genericErrorHandler,
  notFoundHandler,
  unauthorizedHandler,
} from "./errorHandlers.js";
import filesRouter from "./files/index.js";
import { publicFolderPath } from "./lib/fs-tools.js";
import productsRouter from "./products/index.js";
import createHttpError from "http-errors";

const port = process.env.PORT;
const server = express();

const whitelist = [
  process.env.FE_DEVELOPMENT_URL,
  process.env.FE_PRODUCTION_URL,
];

const corsOpts = {
  origin: (origin, corsNext) => {
    console.log("Current origin: " + origin);
    if (!origin || whitelist.indexOf(origin) !== -1) {
      corsNext(null, true);
    } else {
      corsNext(createHttpError(400, `Origin ${origin} is not allowed`));
    }
  },
};

server.use(cors(corsOpts));
server.use(express.json());
server.use(express.static(publicFolderPath));

// ...............................CRUD ENDPOINTS................................
server.use("/products", productsRouter);
server.use("/product", filesRouter);

// ....................................ERROR HANDLERS................................
server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);
server.use(unauthorizedHandler);

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log("Server listening on port:", port);
});
