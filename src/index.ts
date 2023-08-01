import Logger from "ts-logger-node";
import fs, { promises } from "fs";
import csv from "csv-parser";
import { RateLimiter } from "limiter";

// Immediately Invoked Function Expression (IIFE) to start the logging process.
(async () => {
  // Log that the process is running.
  Logger.print("RUNNING", "GENERAL");

  // The following code is commented out for now, probably being used for testing purposes.
  // const cardName = "doubling season";
  // const card = await fetchCardByName(cardName);
  // Logger.print(card, "GENERAL");

  // downloadCardArt(card, cardName);

  // Initialize arrays to store card names and double face card names.
  let cardList: string[] = [];

  const dir = "./card_lists";
  const files = fs.readdirSync(dir);

  for (const file of files) {
    // Read data from a CSV file containing card names.
    fs.createReadStream(dir + "/" + file)
      .pipe(csv())
      .on("data", async (row) => {
        // Process each row in the CSV and convert the card names to a consistent format.
        const cardName = row.name
          .replaceAll(" // ", "_")
          .replaceAll("&", "")
          .replaceAll(",", "")
          .replaceAll("'", "")
          .replaceAll(" ", "_")
          .toLowerCase();
        cardList.push(cardName);
      })
      .on("end", async () => {
        // Log that the CSV file has been successfully processed.
        console.log("CSV file successfully processed");
        console.log(cardList);

        // Create a rate limiter to control the number of requests made per second.
        // This limiter allows 8 requests per second.
        const limiter = new RateLimiter({
          tokensPerInterval: 10,
          interval: "second",
        });

        // Process each card name in the cardList array and download its card art.
        cardList.forEach(async (cardName, i) => {
          // Remove tokens from the limiter to control the request rate.
          const remainingRequests = await limiter.removeTokens(1);
          try {
            // Fetch card details from an external API using the card name.
            const card = await fetchCardByName(cardName);

            // Check if the card has an 'image_uris' property, indicating it's not a double face card.
            if (card["image_uris"]) {
              // If it's a single face card, download its card art.
              let cardString: string = JSON.stringify(
                card["image_uris"]["large"]
              ).replace('"', "");
              await downloadCardArt(cardString, cardName, file);
            } else {
              // If it's a double face card, download both faces' card art.
              const cardStringFront = JSON.stringify(
                card["card_faces"][0]["image_uris"]["large"]
              ).replace('"', "");
              const cardStringBack = JSON.stringify(
                card["card_faces"][1]["image_uris"]["large"]
              ).replace('"', "");
              await downloadCardArt(cardStringFront, cardName + "_front", file);
              await downloadCardArt(cardStringBack, cardName + "_back", file);
            }
          } catch (err) {
            // If there's an error, log that the card cannot be downloaded.
            Logger.print(cardName + " cannot be downloaded.", "ERROR");
          }
        });
      });
  }
})();

/**
 * Asynchronously download card art from the provided URL and save it to a file with the given card name.
 * @param {string} url - The URL of the card art to download.
 * @param {string} cardName - The name of the card used for saving the file.
 * @returns {Promise<void>} A promise that resolves after the card art is downloaded and saved.
 */
async function downloadCardArt(
  url: string,
  cardName: string,
  folder: string
): Promise<void> {
  const response = await fetch(url);

  folder = folder.split(".csv")[0];

  const blob = await response.blob();

  const arrayBuffer = await blob.arrayBuffer();

  const buffer = Buffer.from(arrayBuffer);

  const cardDir = "./card_art_downloads";
  if (!fs.existsSync(cardDir)) fs.mkdirSync(cardDir);
  if (!fs.existsSync(cardDir + "/" + folder.split(".csv")))
    fs.mkdirSync(cardDir + "/" + folder);
  await promises.writeFile(`${cardDir}/${folder}/${cardName}.jpg`, buffer);
  // Log that the card art has been downloaded.
  Logger.print(cardName + " art downloaded", "GENERAL");
}

/**
 * Fetch card details from an external API using the provided card name.
 * @param {string} name - The name of the card to fetch.
 * @returns {Promise<any>} A promise that resolves with the fetched card details as an object.
 */
async function fetchCardByName(name: string): Promise<any> {
  // The following options parameter is currently commented out, but it can be used for future extensions.
  // options?: {
  //   searchType?: "exact" | "fuzzy";
  //   art?: { onlyArt: boolean; artType: "small" | "large" | "png" };
  // }
  const searchType = /* options?.searchType || */ "exact";

  // Use the 'request' function to fetch card details from the API.
  const card: any = await request(
    `https://api.scryfall.com/cards/named?${searchType}=${name}`
  );

  return card;
}

/**
 * Make an asynchronous HTTP request and return the response data as a specified type.
 * @template TResponse - The type of the response data to be returned.
 * @param {string} url - The URL of the API endpoint to make the request to.
 * @param {RequestInit} config - Optional configuration for the fetch request. Default is an empty object.
 * @returns {Promise<TResponse>} A promise that resolves with the response data as the specified type.
 */
async function request<TResponse>(
  url: string,
  config: RequestInit = {}
): Promise<TResponse> {
  // Inside the function, use the 'fetch' function to make the HTTP request and get the response.
  const response = await fetch(url, config);

  // Parse the response data as JSON and return it as the specified type.
  const data = await response.json();
  return data as TResponse;
}
