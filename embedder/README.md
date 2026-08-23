# embedder

- Receives the data from the google sheet.
- loops through it checks for new data.
- downloads the new data.
- chunks the downloaded data.
- provides it to the embedding model.
- updates the database with the embedding.
- Generates a hash to prevent further operation on the same data.
