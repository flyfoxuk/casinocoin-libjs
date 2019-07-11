import * as common from '../common'
import * as keypairs from 'casinocoin-libjs-keypairs'
import * as binary from 'casinocoin-libjs-binary-codec'
const {validate, cscToDrops} = common

function signPaymentChannelClaim(channel: string, amount: string,
  privateKey: string
): string {
  validate.signPaymentChannelClaim({channel, amount, privateKey})

  const signingData = binary.encodeForSigningClaim({
    channel: channel,
    amount: cscToDrops(amount)
  })
  return keypairs.sign(signingData, privateKey)
}

export default signPaymentChannelClaim
