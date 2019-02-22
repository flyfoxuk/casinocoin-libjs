import { CasinocoinAPIBroadcast } from "../../src";

function main() {
    const servers = ["wss://s1.casinocoin.org", "wss://s2.casinocoin.org"];
    const api = new CasinocoinAPIBroadcast(servers);
    api.connect().then(() => {
        api.getServerInfo().then((info: any) => {
            console.log(JSON.stringify(info, null, 2));
        });
        api.on("ledger", (ledger: any) => {
            console.log(JSON.stringify(ledger, null, 2));
        });
    });
}

main();
