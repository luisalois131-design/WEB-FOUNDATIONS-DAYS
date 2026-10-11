
# Library Books REST API Design

## Overview

The Library Books API allows clients to list, retrieve, create, update, and delete books. It also supports searching for books by author.

Base URL: `/api`

## Endpoints

### 1. List All Books

- **Method:** GET
- **Path:** `/api/books`
- **Description:** Retrieves a list of all books in the library.
- **Example request body:** Not required.
- **Success status code:** `200 OK`

### 2. Get One Book

- **Method:** GET
- **Path:** `/api/books/{id}`
- **Description:** Retrieves the details of a single book using its unique ID.
- **Example request body:** Not required.
- **Success status code:** `200 OK`

Example: `GET /api/books/12`

### 3. Create a Book

- **Method:** POST
- **Path:** `/api/books`
- **Description:** Adds a new book to the library.
- **Example request body:**

  ```json
  {
    "title": "Things Fall Apart",
    "author": "Chinua Achebe",
    "publishedYear": 1958
  }
  ```

- **Success status code:** `201 Created`

### 4. Update a Book

- **Method:** PUT
- **Path:** `/api/books/{id}`
- **Description:** Replaces the details of an existing book.
- **Example request body:**

  ```json
  {
    "title": "Things Fall Apart",
    "author": "Chinua Achebe",
    "publishedYear": 1958
  }
  ```

- **Success status code:** `200 OK`

### 5. Delete a Book

- **Method:** DELETE
- **Path:** `/api/books/{id}`
- **Description:** Deletes a book using its unique ID.
- **Example request body:** Not required.
- **Success status code:** `204 No Content`

### 6. List Books by Author

- **Method:** GET
- **Path:** `/api/books?author={authorName}`
- **Description:** Retrieves books written by the specified author.
- **Example request body:** Not required.
- **Success status code:** `200 OK`

Example: `GET /api/books?author=Chinua%20Achebe`

## Error Responses

### 400 Bad Request

- **Meaning:** The request contains invalid data or parameters.
- **Example:** A client tries to create a book without a required title or author.

### 404 Not Found

- **Meaning:** The requested resource does not exist.
- **Example:** A client requests `GET /api/books/999` when book ID 999 does not exist.

## Notes

- The API uses standard HTTP methods to perform operations on books.
- JSON is used for request and response data where applicable.
- Book IDs uniquely identify individual books.
- The server should validate incoming data before creating or updating books.