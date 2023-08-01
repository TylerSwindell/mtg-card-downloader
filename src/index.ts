import Logger from "ts-logger-node";
import fs from "fs";
import csv from "csv-parser";
import { RateLimiter } from "limiter";

import { downloadCardArt, fetchCardByName } from "./scryfallAPI";

// Immediately Invoked Function Expression (IIFE) to start the logging process.
(async () => {
  // Log that the process is running.
  Logger.print("RUNNING", "GENERAL");

  // Initialize arrays to store card names and double face card names.
  let cardNameList: string[] = [];

  const cardListDir = "./card_lists";
  const cardListCSVs = fs.readdirSync(cardListDir);

  for (const cardListFile of cardListCSVs) {
    // Read data from a CSV file containing card names.
    fs.createReadStream(cardListDir + "/" + cardListFile)
      .pipe(csv())
      // Process each row in the CSV and convert the card names to a consistent format.
      .on("data", async (card) => cardNameList.push(parseCardName(card)))
      .on("end", async () => {
        // Log that the CSV file has been successfully processed.
        Logger.print("CSV file successfully processed", "GENERAL");

        // Create a rate limiter to control the number of requests made per second.
        // This limiter allows 8 requests per second.
        const limiter = new RateLimiter({
          tokensPerInterval: 10,
          interval: "second",
        });

        // Process each card name in the cardList array and download its card art.
        cardNameList.forEach(async (cardName) => {
          // Remove tokens from the limiter to control the request rate.
          const remainingRequests = await limiter.removeTokens(1);
          try {
            // Fetch card details from an external API using the card name.
            const card = await fetchCardByName(cardName);

            // Check if the card has an 'image_uris' property, indicating it's not a double face card.
            if (card["image_uris"]) {
              // If it's a single face card, download its card art.
              await downloadCardArt(
                parseCardImageURI(card),
                cardName,
                cardListFile
              );
            } else {
              // If it's a double face card, download both faces' card art.
              await downloadCardArt(
                parseCardImageURI(card["card_faces"][0]),
                cardName + "_front",
                cardListFile,
                true
              );
              await downloadCardArt(
                parseCardImageURI(card["card_faces"][1]),
                cardName + "_back",
                cardListFile,
                true
              );
            }
          } catch (err) {
            // If there's an error, log that the card cannot be downloaded.
            Logger.print(cardName + " cannot be downloaded:\n" + err, "ERROR");
          }
        });
      });
  }
})();

function parseCardName(card: any): string {
  return card.name
    .replaceAll(" // ", "_")
    .replaceAll("&", "")
    .replaceAll(",", "")
    .replaceAll("'", "")
    .replaceAll(" ", "_")
    .toLowerCase();
}

function parseCardImageURI(card: any): string {
  return JSON.stringify(card["image_uris"]["large"]).replace('"', "");
}
