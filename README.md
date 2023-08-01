# Magic: The Gathering Card Downloader

## Description

Magic: The Gathering Card Downloader is a Node.js project designed to download images of Magic: The Gathering cards listed in a CSV file. The CSV file contains card names as the first field, and the application processes each row, downloads the card art, and saves it to a local directory. The project utilizes TypeScript and various Node.js packages for handling CSV, logging, rate limiting, and HTTP requests.

## Installation

1. Make sure you have [Node.js](https://nodejs.org) installed on your machine.
2. Clone or download the repository from [GitHub](https://github.com/your-repository-url).
3. Open a terminal and navigate to the project's root directory.
4. Run the following command to install the project dependencies:
   ```
   npm install
   ```

## Usage

1. Prepare a CSV file containing card names. The first column of the CSV file should contain the card names.
2. Place the CSV file(s) inside the `./card_lists` directory.
3. To start the card downloading process, execute the following command:
   ```
   npm run start
   ```
   The application will read the CSV file(s) in the `./card_lists` directory, process each card name, and download the card art. The downloaded images will be saved in the `./card_art_downloads` directory.

## Scripts in `package.json`

- `dev`: Starts the development server using `vitest`.
- `test`: Executes tests using `vitest`.
- `build`: Builds the TypeScript code using `tsup`, generating CommonJS and ES modules, as well as TypeScript declaration files.
- `start`: Similar to `build`, but it then runs the built application using `node`.
- `lint`: Lints the TypeScript code using the TypeScript compiler (`tsc`) without emitting files.
- `ci`: Executes linting, tests, and builds the project for Continuous Integration (CI) purposes.

## Code Documentation

The code is divided into three main functions:

### 1. `downloadCardArt(url: string, cardName: string): Promise<void>`

Asynchronously downloads card art from the provided URL and saves it to a file with the given card name.

**Parameters:**

- `url` (string): The URL of the card art to download.
- `cardName` (string): The name of the card used for saving the file.

### 2. `fetchCardByName(name: string): Promise<any>`

Fetches card details from an external API using the provided card name.

**Parameters:**

- `name` (string): The name of the card to fetch.

**Returns:**
A promise that resolves with the fetched card details as an object.

### 3. `request<TResponse>(url: string, config: RequestInit = {}): Promise<TResponse>`

Makes an asynchronous HTTP request and returns the response data as a specified type.

**Type Parameters:**

- `TResponse`: The type of the response data to be returned.

**Parameters:**

- `url` (string): The URL of the API endpoint to make the request to.
- `config` (RequestInit): Optional configuration for the fetch request. Default is an empty object.

**Returns:**
A promise that resolves with the response data as the specified type.

### Code Flow

1. The application starts by logging that it is running.
2. It reads CSV files from the `./card_lists` directory.
3. For each CSV file, it processes the card names, standardizes them, and stores them in the `cardList` array.
4. The application creates a rate limiter to control the number of requests made per second. The limiter allows 8 requests per second.
5. The application iterates over the `cardList` array and fetches card details from an external API using each card name.
6. If the card has an 'image_uris' property, it is treated as a single face card, and its card art is downloaded and saved.
7. If the card is a double face card, both faces' card art is downloaded and saved with appropriate naming.

## Future Enhancements

The project can be extended in the future to include more download options or additional features, such as:

- Downloading card arts in different sizes or formats.
- Enhancing the search options for card names (e.g., fuzzy search).
- Adding support for other external APIs or data sources for card details.
- Improving error handling and logging for a more robust application.

---

Note: The `package.json` scripts mentioned above assume you have [pnpm](https://pnpm.js.org) installed. If you prefer using npm or yarn, you can replace `pnpm` with `npm` or `yarn` in the commands accordingly.
