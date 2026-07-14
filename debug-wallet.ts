
import { prisma } from "./lib/db";

async function main() {
    console.log("Checking ProgramWallet model...");

    // @ts-ignore
    if (prisma.programWallet) {
        console.log("SUCCESS: prisma.programWallet exists!");
        try {
            // @ts-ignore
            const count = await prisma.programWallet.count();
            console.log(`Current wallet count: ${count}`);
        } catch (e) {
            console.error("Error querying programWallet:", e);
        }
    } else {
        console.error("FAILURE: prisma.programWallet is MISSING on the client instance.");
        console.log("Keys available:", Object.keys(prisma).filter(k => !k.startsWith('_')));
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
