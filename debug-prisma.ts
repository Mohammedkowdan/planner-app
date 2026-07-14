
import { prisma } from "./lib/db";

async function main() {
    console.log("Checking Prisma Client...");
    console.log("Keys on prisma instance:", Object.keys(prisma));

    // @ts-ignore
    if (prisma.calendarEvent) {
        console.log("SUCCESS: prisma.calendarEvent exists!");
    } else {
        console.error("FAILURE: prisma.calendarEvent is MISSING.");
        console.log("Available models might be:", Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));
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
