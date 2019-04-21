import {createHTTPServer} from "../src/http";

const port = 5990;
const serverUrl = "wss://moon.casinocoin.eu:6006";
const main = () => {
  const server = createHTTPServer({server: serverUrl}, port);
  server.start().then(() => {
    console.log("Server started on port " + String(port));
  });
};

main();
