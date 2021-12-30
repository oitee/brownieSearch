
export function config() {
    const clientID = process.env.CLIENT_ID;
    const client_secret = process.env.CLIENT_SECRET;
    const port = process.env.PORT;
    const baseUrl = process.env.DOMAIN;
    const httpsSupported = process.env.HTTPS === "true";
    const salt = process.env.SALT || "haddock";
  
    return { clientID, client_secret, port, baseUrl, httpsSupported, salt };
  }
  