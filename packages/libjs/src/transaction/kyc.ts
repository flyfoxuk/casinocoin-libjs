import * as utils from './utils'
import {Prepare} from './types'
import {KYCSet} from '../ledger/transaction-types.js'

function createKYCSetTransaction(kyc: KYCSet): Object {
    const verifications = []
    if (kyc.verifications) {
        kyc.verifications.forEach(element => {
            if (element.indexOf('-') !== -1 && element.length === 36) {
                // remove dashes
                const hexUUID = element.replace(/-/g, '')
                verifications.push(hexUUID.toUpperCase())
            } else if (element.length === 32) {
                verifications.push(element.toUpperCase())
            } else {
                console.log('invalid UUID: ' + element)
            }
        })
    }

    const txJSON: any = {
        TransactionType: 'KYCSet',
        Account: kyc.kycAccount,
        Verifications: verifications,
        Destination: kyc.destination
    }

    if (kyc.verified) {
        txJSON.SetFlag = 1
    } else {
        txJSON.ClearFlag = 1
    }
    return txJSON
}

function prepareKYCSet(kyc: KYCSet): Promise<Prepare> {
    const txJSON = createKYCSetTransaction(kyc)
    return utils.prepareTransaction(txJSON, this, {})
}

export default prepareKYCSet
