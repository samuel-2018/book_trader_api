# API: Manage a Book Trading Club

See [the Client’s](https://github.com/samuel-2018/book_trader_client) README.md file for the project description.

## Getting Started

This API requires a MySQL database. You can [download MySQL Workbench](https://dev.mysql.com/downloads/) to setup and run the database.

After creating the database, add a ‘config’ folder in the root of the project. In the folder, add a ‘config.json’ file. The contents of the file should look something like this:

```
{
  "development": {
    "username": "root",
    "password": "thePasswordYouChose",
    "database": "theNameOfYourDatabase",
    "host": "localhost",
    "dialect": "mysql"
  },
}
```

To get up and running with this project, run the following commands from the root of the folder that contains this README file.

First, install the project's dependencies using `npm`.

```
npm install
```

Second, seed the database with the Archive user\*.

```
npx sequelize db:seed:all
```

And lastly, start the application.

```
npm start
```

To test the Express server, browse to the URL [http://localhost:5000/](http://localhost:5000/).

\*The API depends upon user #1 serving as an archive. In a situation where a user deletes a book and that book is also part of a trade record, the ownership of the book goes to the archive user. That allows the book data to persist.

## API Reference

---

### Get all users

#### HTTP METHOD Route

`GET /api/users/all`

---

### Get currently authenticated user

#### HTTP METHOD Route

`GET /api/users`

#### Response body

```
{
  "userId": 1,
  "firstName": "Joe",
  "lastName": "Smith",
  "username": "JoeS",
  "country": "United States",
  "email": "joe@smith.com",
  "city": "Columbus",
  "state": "Ohio"
}
```

---

### Get one user (profile)

#### HTTP METHOD Route

`GET /api/users/:userId`

#### Response body

```
{
  "userId": 1,
  "firstName": "Joe",
  "lastName": "Smith",
  "username": "JoeS",
  "country": "United States",
  "city": "Columbus",
  "state": "Ohio"
}
```

---

### Create a user account

#### HTTP METHOD Route

`POST /api/users`

#### Request body

```
{
  "firstName": "Joe",
  "lastName": "Smith",
  "email": "joe@smith.com",
  "username": "JoeS",
  "country": "United States",
  "state": "Ohio",
  "city": "Columbus",
  "password": "pass"
}
```

## Required fields: firstName, lastName, country, username, password

### Update a user account

#### HTTP METHOD Route

`PUT /api/users/:userId`

#### Request body

```
{
  "firstName": "Joe",
  "lastName": "Smith",
  "email": "joe@smith.com",
  "username": "JoeS",
  "country": "United States",
  "state": "Ohio",
  "city": "Columbus",
  "password": "pass"
}
```

Required fields: firstName, lastName, country, username.

---

### Get all books

#### HTTP METHOD Route

`GET /api/books`

#### Response body

```
[
  {
    "bookId": 1,
    "title": "A great book 1",
    "author": "John Author",
    "ownerId": 2,
    "owner": {
        "username": "SallyJ",
        "country": "United States",
        "state": "Ohio",
        "city": "Columbus"
    },
    "takeBooksRequest": [
        {
            "requestId": 9,
            "requesterId": 1,
            "requester": {
                "username": "JoeS"
            }
        }
    ]
  },
  {
    ...
  }
]
```

---

### Get one book

#### HTTP METHOD Route

`GET /api/books/:bookId`

#### Response body

```
{
   "bookId": 1,
   "title": "A great book",
   "author": "John Author",
   "genre": "Sci-Fi",
   "year": "2019",
   "condition": "Used",
   "comments: "This is a great book!",
   "createdAt": "2019-09-18T03:13:45.000Z",
   "ownerId": 2,
   "owner": {
      "username": "SallyJ",
      "country": "United States",
      "state": "Ohio",
      "city": "Columbus"
   }
}
```

---

### Get all books from one user

#### HTTP METHOD Route

`GET /api/books/owner/:ownerId`

#### Response body

```
[
  {
      ...
  }
]

*See "Get all books" example.*

```

---

### Create a book

#### HTTP METHOD Route

`POST /api/books`

#### Request body

```
{
   "title": "A great book",
   "author": "John Author",
   "genre": "Sci-Fi",
   "year": "2019",
   "condition": "Used",
   "comments": "This is a great book!",
}

```

Route requires authentication.

---

### Delete a book

#### HTTP METHOD Route

`DELETE /api/books/bookId`

---

### Get all trades

#### HTTP METHOD Route

`GET /api/trades`

#### Response body

```
[
  {
    "tradeId": 48,
    "createdAt": "2019-09-20T01:52:58.000Z",
    "requesterId": 1,
    "requesteeId": 2,
    "requester": {
      "username": "JoeS"
    },
    "requestee": {
      "username": "SallyJ"
    },
    "giveBooksTrade": [
      {
        "bookId": 2,
        "title": "A wonderful book 2",
        "author": "John Author",
        "createdAt": "2019-09-17T22:51:03.000Z",
        "owner": {
            "username": "SallyJ",
            "country": "United States",
            "state": "Ohio",
            "city": "Columbus"
        },
        "takeBooksRequest": [
          {
            "requesterId": 1,
            "requester": {
                "username": "JoeS"
            }
          }
        ]
      },
      {
          ...
      },
      {
          ...
      }
    ],
    "takeBooksTrade": [
      {
        "bookId": 4,
        "title": "A wonderful book 4",
        "author": "John Author",
        "createdAt": "2019-09-18T03:13:28.000Z",
        "owner": {
            "username": "JoeS",
            "country": "United States",
            "state": "Ohio",
            "city": "Columbus"
        },
        "takeBooksRequest": []
      },
      {
          ...
      },
      {
          ...
      }
    ]
  },
]
```

---

### Get all requests

#### HTTP METHOD Route

`GET /api/requests`

#### Response body

```
[
  {
      "requestId": 21,
      "createdAt": "2019-09-20T02:13:54.000Z",
      "requesterId": 1,
      "requesteeId": 2,
      "requester": {
          "username": "JoeS"
      },
      "requestee": {
          "username": "SallyJ"
      },
      "giveBooksRequest": [
          {
              "bookId": 4,
              "title": "A wonderful book 4",
              "author": "John Author",
              "createdAt": "2019-09-18T03:13:28.000Z",
              "owner": {
                  "username": "JoeS",
                  "country": "United States",
                  "state": "Ohio",
                  "city": "Columbus"
              },
              "takeBooksRequest": []
          },
          {
              ...
          }
      ],
      "takeBooksRequest": [
          {
             "bookId": 1,
              "title": "A great book 1",
              "author": "John Author",
              "createdAt": "2019-09-17T22:50:45.000Z",
              "owner": {
                  "username": "SallyJ",
                  "country": "United States",
                  "state": "Ohio",
                  "city": "Columbus"
              },
              "takeBooksRequest": [
                  {
                      "requestId": 21,
                      "requesterId": 1,
                      "requester": {
                          "username": "JoeS"
                      }
                  }
              ]
          },
          {
             ...
          }
      ]
  },
]
```

---

### Get all requests involving one book

#### HTTP METHOD Route

`GET /api/requests/book/:bookId`

#### Response body

```
[
    {
        ...
    }
]

*See "Get all requests" example.*

```

### Get one request

#### HTTP METHOD Route

`GET /api/requests/:requestId`

#### Response body

```

{
    ...
}

*See "Get all requests" example.*

```

---

### Delete a request

#### HTTP METHOD Route

`DELETE /api/requests/:requestId`

Route requires authentication.

---

### Accept a request

#### HTTP METHOD Route

`DELETE /api/requests/accept/:requestId`

Route requires authentication.

Accepting is only allowed by Sequelize if the current authenticated user id matches that of the requestee on the request.

Sequelize will take several actions:

- Add the request to the trade records.

- Change ownership of books that are in the request.

- Finally, delete all requests that match any book in the request.

---

### Create a request

#### HTTP METHOD Route

`POST /api/requests`

#### Request body

```
{
  "requesteeId": 2,
  "takeBooksId": [2],
  "giveBooksId": [1]
}
```

---
