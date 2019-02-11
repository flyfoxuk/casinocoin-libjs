import * as common from "../common";
import keypairs from "casinocoin-libjs-keypairs";
import binary from "casinocoin-libjs-binary-codec";

const { validate, cscToDrops } = common;

function signPaymentChannelClaim(
  channel: string,
  amount: string,
  privateKey: string,
): string {
  validate.signPaymentChannelClaim({ channel, amount, privateKey });

  const signingData = binary.encodeForSigningClaim({
    amount: cscToDrops(amount),
    channel,
  });
  return keypairs.sign(signingData, privateKey);
}

export default signPaymentChannelClaim;
