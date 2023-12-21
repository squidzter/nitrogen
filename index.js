const workerpool = require("workerpool");
const pool = workerpool.pool();
const { writeFileSync } = require("fs");

const generateLink = async () => {
    const uuid = () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (function (t) {
        const e = 16 * Math.random() | 0;
        return ("x" === t ? e : 3 & e | 8).toString(16)
    }));

    const r = await fetch("https://api.discord.gx.games/v1/direct-fulfillment", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ partnerUserId: uuid() })
    }).then(r => r.json());

    return `https://discord.com/billing/partner-promotions/1180231712274387115/${r.token}`;
};

(async () => {
    const inquirer = (await import("inquirer")).default;
    const answers = await inquirer.prompt([{
        name: "amount",
        type: "number",
        message: "How many links do you want?"
    }]);
    const linkAmount = answers.amount;
    const links = [];

    for (let i = 0; i < linkAmount; i++) {
        pool.exec(generateLink)
            .then(link => links.push(link));
    };

    const interval = setInterval(() => {
        console.log(`Generated ${links.length}/${linkAmount} (${(links.length / linkAmount * 100).toFixed(2)}%) promo links`);
        if (links.length >= linkAmount) {
            console.log("Done!");
            writeFileSync("links.txt", links.join("\n"));
            pool.terminate();
            clearInterval(interval);
        };
    }, 5000);
})();
