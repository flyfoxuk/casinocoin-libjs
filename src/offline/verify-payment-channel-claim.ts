import * as common from "../common";
import keypairs from "casinocoin-libjs-keypairs";
import binary from "casinocoin-libjs-binary-codec";

const { validate, cscToDrops } = common;

function verifyPaymentChannelClaim(
  channel: string,
  amount: string,
  signature: string,
  publicKey: string,
): string {
  validate.verifyPaymentChannelClaim({ channel, amount, signature, publicKey });

  const signingData = binary.encodeForSigningClaim({
    amount: cscToDrops(amount),
    channel,
  });
  return keypairs.verify(signingData, signature, publicKey);
}

export default verifyPaymentChannelClaim;
