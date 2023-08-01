/**
 * Make an asynchronous HTTP request and return the response data as a specified type.
 * @template TResponse - The type of the response data to be returned.
 * @param {string} url - The URL of the API endpoint to make the request to.
 * @param {RequestInit} config - Optional configuration for the fetch request. Default is an empty object.
 * @returns {Promise<TResponse>} A promise that resolves with the response data as the specified type.
 */
export default async function request<TResponse>(
  url: string,
  config: RequestInit = {}
): Promise<TResponse> {
  // Inside the function, use the 'fetch' function to make the HTTP request and get the response.
  const response = await fetch(url, config);

  // Parse the response data as JSON and return it as the specified type.
  const data = await response.json();
  return data as TResponse;
}
