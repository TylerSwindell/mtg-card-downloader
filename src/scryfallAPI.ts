import fs, { promises } from "fs";
import request from "./request";
import Logger from "ts-logger-node";

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

export { downloadCardArt, fetchCardByName };
