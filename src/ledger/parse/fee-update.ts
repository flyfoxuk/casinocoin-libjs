import BigNumber from "bignumber.js";
import { dropsToCsc } from "./utils";

function parseFeeUpdate(tx: any) {
    const baseFeeDrops = (new BigNumber(tx.BaseFee, 16)).toString();
    return {
        baseFeeCSC: dropsToCsc(baseFeeDrops),
        referenceFeeUnits: tx.ReferenceFeeUnits,
        reserveBaseCSC: dropsToCsc(tx.ReserveBase),
        reserveIncrementCSC: dropsToCsc(tx.ReserveIncrement),
    };
}

export default parseFeeUpdate;
