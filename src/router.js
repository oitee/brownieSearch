import express from "express";
import * as users from "./users.js";
import * as find from "./search.js";
import * as env from "./env_variables.js";
import Store from "./store.js";
import { pbkdf2Sync } from "crypto";

const userToStoreMap = new Map();

export const router = express.Router();
router.use(auth);

//---Front-end Routers------------//

router.get("/tokens", users.generateTokens);

router.get("/redirect", users.callBack);

// No need for a logout route, as we are not creating any session

//---API routes ------------//

router.post("/insert", find.insertDoc);

router.get("/search", find.searchDoc);

router.get("/fetch", find.fetchDoc);

//==========auth Middleware

function auth(request, response, next) {
  if (request.path === "/tokens" || request.path === "/redirect") {
    return next();
  }

  //sample Authorization header:
  // authorization: Bearer oitee.codes@gmail.com@@uVl62RekHg==
  if (
    !request.headers.authorization ||
    request.headers.authorization.indexOf("Bearer")
  ) {
    return response.status(400).json({ error: "Missing Authorization Header" });
  }

  const [email, inputHash] = request.headers.authorization
    .split(" ")[1]
    .split("@@");

  const { salt } = env.config();
  const computedHash = pbkdf2Sync(email, salt, 100, 7, "sha512").toString(
    "base64"
  );
  if (inputHash !== computedHash) {
    return response.status(400).json({
      error: "API token invalid: email address does not match hashed value",
    });
  }
  if (!userToStoreMap.has(email)) {
    const newStore = new Store();
    userToStoreMap.set(email, newStore);
  }
  request.store = userToStoreMap.get(email);

  return next();
}
