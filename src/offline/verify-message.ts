import keypairs from "casinocoin-libjs-keypairs";

function hexToString(hex: string): string | undefined {
  return hex ? new Buffer(hex, "hex").toString("utf-8") : undefined;
}

function convertStringToHex(inputString: string) {
  return (inputString !== undefined && inputString.length > 0) ?
    new Buffer(inputString, "utf8").toString("hex").toUpperCase() :
    "";
}

function verifyMessage(
  msg: string,
  signature: string,
  publicKey: string,
): boolean {
  return keypairs.verifyMessage(convertStringToHex(msg), signature, publicKey);
}

export default verifyMessage;
