import express from "express";
import cookieParser from "cookie-parser";
import * as router from "./router.js";
import * as env from "./env_variables.js";

const app = express();
app.use(router.router);

app.use(cookieParser());


app.listen(env.config().port, () =>
  console.log(`Started listening on ${process.env.PORT}...`)
);

