# book_trader_api DRAFT

## API Reference

---

### Get all users

#### HTTP METHOD Route

`GET /api/users`

---

### Get currently authenticated user

#### HTTP METHOD Route

`GET /api/user`

#### Response body

```
{
  "user": {
    "userId": 1,
    "firstName": "Joe",
    "lastName": "Smith",
    "emailAddress": "joe@smith.com",
    "username": "JohnS",
    "country": "United States",
    "state": "Ohio",
    "city": "Columbus",
   }
}
```

---

### Get one user (profile)

#### HTTP METHOD Route

`GET /api/user/:userId`

#### Response body

```
{
  "user": {
    "userId": 1,
    "firstName": "Joe",
    "lastName": "Smith",
    "emailAddress": "joe@smith.com",
    "username": "JohnS",
    "country": "United States",
    "state": "Ohio",
    "city": "Columbus",
  }
}
```

---

### Create a user account

#### HTTP METHOD Route

`POST /api/user`

#### Request body

```
{
  "firstName": "Joe",
  "lastName": "Smith",
  "emailAddress": "joe@smith.com"
  "username": "JohnS",
  "country": "United States",
  "state": "Ohio",
  "city": "Columbus",
  "password": "password"
}
```

---

### Get all books

#### HTTP METHOD Route

`GET /api/books`

---

### Get one book

#### HTTP METHOD Route

`GET /api/books/:id`

#### Response body

```
{
   bookId: 1,
   title: "A great book",
   author: "John Author",
   genre: "Sci-Fi",
   year: "2019",
   condition: "Used",
   comments: "This is a great book!",
   ownerId: 2,
   "owner": {
     "firstName": "Sally",
     "lastName": "Jones"
   }
}
```

---

### Get all books from one user

#### HTTP METHOD Route

`GET /api/books/:ownerId`
// Sequelize will query Books database for matches to ownerId in ownerId.

#### Response body

```
{
   bookId: 1,
   title: "A great book",
   author: "John Author",
   genre: "Sci-Fi",
   year: "2019",
   condition: "Used",
   comments: "This is a great book!",
   ownerId: 2,
   "owner": {
     "firstName": "Sally",
     "lastName": "Jones"
   }
}
```

---

### Create a book

#### HTTP METHOD Route

`POST /api/books`

#### Request body

```
{
   title: "A great book",
   author: "John Author",
   genre: "Sci-Fi",
   year: "2019",
   condition: "Used",
   comments: "This is a great book!",
}
```

---

### Get all trades

#### HTTP METHOD Route

`GET /api/trades`

#### Response body

```
{
  "trade": {
    "tradeId": 1,
    "requesterId": 2,
    "requesteeId": 1,
    "takeBooksId": [37],
    "giveBooksId": [4],
    // Use include in Sequelize to provide all data for each book?
  }
}
```

---

### Get all requests

#### HTTP METHOD Route

`GET /api/requests`

#### Response body

```
{
    "request": {
    "requestId": 1,
    "requesterId": 2,
    "requesteeId": 1,
    "takeBooksId": [37],
  	"giveBooksId": [4],
	// Use include in Sequelize to provide all data for each book?
    }
}
```

---

### Get all requests for one book

#### HTTP METHOD Route

`GET /api/requests/:booksId`
// Sequelize will query Request database for matches to booksId in either takeBooksId or giveBooksId.

#### Response body

```
{
  "request": {
    "requestId": 1,
    "requesterId": 2,
    "requesteeId": 1,
    "takeBooksId": [37],
    "giveBooksId": [4],
    // Use include in Sequelize to provide all data for each book?
  }
}
```

---

### Delete a request

#### HTTP METHOD Route

`DELETE /api/requests/:requestId`

// This is only allowed by Sequelize if the current authenticated user id matches that of the requesterId or the requestee on the request.

### Accept  a request

#### HTTP METHOD Route

`DELETE /api/requests/accept/:requestId`

// This is only allowed by Sequelize if the current authenticated user id matches that of the requestee on the request.

// Sequelize will take several actions:

// Add the request to the Trade records.

// Change ownership of books that are in the request.

// Finally, delete the request.

### Create a request

#### HTTP METHOD Route

`POST /api/requests`

#### Request body

```
{
  "requesteeId": 1,
  "takeBooksId": [37],
  "giveBooksId": [4]
  // The above may not be the correct format.
}
```

---
