import { createHTTPServer } from "../src/http";

const port = 5990;
const serverUrl = "wss://ws01.casinocoin.org:4443";
const main = () => {
  const server = createHTTPServer({ server: serverUrl }, port);
  server.start().then(() => {
    console.log("Server started on port " + String(port));
  });
};

main();
