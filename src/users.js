import * as env from "./env_variables.js";
import fetch from "node-fetch";
import { pbkdf2Sync } from "crypto";

export async function generateTokens(request, response) {
  //  No need for checking if cookies have tokens
  return response.send(`
          <h1> <a href=${authUrl()}> Log in with Google to generate your API token</a></h1>
          `);
}

export async function callBack(request, response) {
  const accessCode = request.query.code;
  const tokens = await accessTokens(accessCode);

  if (tokens.error) {
    console.error("Error in fetching tokens");
    console.error(tokens);
    return response.status(500).send("Something went wrong");
  }

  const { email, name } = await getUserProfile(tokens);
  const { salt } = env.config();

  const hash = pbkdf2Sync(email, salt, 100, 7, "sha512").toString("base64");
  const token = email + "@@" + hash;

  return response.send(`<h1> Hi, ${name}, here's your API token! </h1>
  <br>
  <h3> Token: ${token} </h2>
  <br>
  Generated using this email: ${email}
  <br>
  Please use this token to make API requests to Brownie Search!`);
}

function authUrl() {
  const { clientID, baseUrl } = env.config();
  const redirectID = `${baseUrl}/redirect`;

  const response = `code`;
  const scope = `https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email`;
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  authUrl.searchParams.append("client_id", clientID);
  authUrl.searchParams.append("redirect_uri", redirectID);
  authUrl.searchParams.append("response_type", response);
  authUrl.searchParams.append("scope", scope);
  authUrl.searchParams.append("prompt", "consent");
  authUrl.searchParams.append("access_type", "offline");

  return authUrl.href;
}

function accessTokens(code) {
  const { clientID, client_secret, baseUrl } = env.config();
  const grant = "authorization_code";
  const redirect_uri = `${baseUrl}/redirect`;

  const params = new URLSearchParams();
  params.append("client_id", clientID);
  params.append("client_secret", client_secret);
  params.append("code", code);
  params.append("grant_type", grant);
  params.append("redirect_uri", redirect_uri);

  return fetch("https://oauth2.googleapis.com/token", {
    method: "post",
    body: params,
  }).then((res) => res.json());
}

async function getUserProfile(tokens, retrying = false) {
  const scope = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json`;
  return fetch(scope, {
    method: "get",
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
    .then((res) => res.json())
    .then(({ name, email }) => {
      if (name) {
        return {
          name: `${name}`,
          email: `${email}`,
          tokens: tokens,
        };
      }
      return {};
    })
    .then(async (res) => {
      if (!res.name) {
        if (retrying) {
          return {};
        }
        let newTokens = await getNewAccessToken(tokens);
        if (newTokens.error) {
          return {};
        }
        return getUserProfile(newTokens, true);
      }
      return res;
    });
}

async function getNewAccessToken(tokens) {
  const params = new URLSearchParams();
  const { clientID, client_secret } = env.config();
  params.append("client_id", clientID);
  params.append("client_secret", client_secret);
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", tokens.refresh_token);

  return fetch(`https://oauth2.googleapis.com/token`, {
    method: "post",
    body: params,
  }).then((res) => res.json());
}
