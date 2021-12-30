import express from "express";
import cookieParser from "cookie-parser";
import * as router from "./router.js";
import * as env from "./env_variables.js";
import bodyParser from 'body-parser';

const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(router.router);




app.listen(env.config().port, () =>
  console.log(`Started listening on ${process.env.PORT}...`)
);

