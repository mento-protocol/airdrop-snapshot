import { providers } from "ethers";

/**
 * Helper function to get the block number for a specific date
 */
export async function getBlockNumberForDate(
   targetDate: Date,
   provider: providers.JsonRpcProvider
): Promise<number> {
   let lowerBound = 0;
   let upperBound = await provider.getBlockNumber();
   let currentDate: Date;

   while (lowerBound <= upperBound) {
      const middleBlockNumber = Math.floor((lowerBound + upperBound) / 2);
      const middleBlock = await provider.getBlock(middleBlockNumber);
      currentDate = new Date(middleBlock.timestamp * 1000); // Convert to milliseconds

      if (currentDate < targetDate) {
         lowerBound = middleBlockNumber + 1;
      } else if (currentDate > targetDate) {
         upperBound = middleBlockNumber - 1;
      } else {
         return middleBlockNumber;
      }
   }

   return lowerBound;
}

/**
 * Strips leading zeros from a hex string
 */
export function stripLeadingZeros(hex: string): string {
   const matched = hex.match(/^0x0*(.*)/);
   return "0x" + (matched ? matched[1] : hex);
}

export function get15thOfEveryMonth(startDate: Date, months: number): Date[] {
   const dates: Date[] = [];
   let currentYear = startDate.getFullYear();
   let currentMonth = startDate.getMonth();

   for (let i = 0; i < months; i++) {
      dates.push(new Date(Date.UTC(currentYear, currentMonth, 15, 23, 59, 29)));

      // Increment the month and adjust year if necessary
      currentMonth += 1;
      if (currentMonth > 11) {
         currentMonth = 0;
         currentYear += 1;
      }
   }

   return dates;
}
