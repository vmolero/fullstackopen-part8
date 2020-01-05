const { gql } = require('apollo-server')
const uuid = require('uuid/v1')
const books = require('./tests/fixtures/books')
const authors = require('./tests/fixtures/authors')

const typeDefs = gql`
  type Book {
    title: String!
    published: Int
    author: String!
    genres: [String!]
    id: ID!
  }

  type Author {
    name: String!
    id: ID!
    bookCount: Int!
    born: Int
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int
      author: String!
      genres: [String!]
    ): Book
    editAuthorBirth(name: String!, setBornTo: Int!): Author
  }
`

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, { author, genre }) => {
      let filteredBooks = books
      if (author) {
        filteredBooks = filteredBooks.filter(
          book => book.author.toLocaleLowerCase() === author.toLocaleLowerCase()
        )
      }
      if (genre) {
        filteredBooks = filteredBooks.filter(book =>
          book.genres
            .map(genre => genre.toLocaleLowerCase())
            .includes(genre.toLocaleLowerCase())
        )
      }
      return filteredBooks
    },
    allAuthors: () => authors
  },
  Author: {
    bookCount: root => {
      return books.filter(
        book =>
          book.author.toLocaleLowerCase() === root.name.toLocaleLowerCase()
      ).length
    }
  },
  Mutation: {
    addBook: (root, args) => {
      const book = { ...args, id: uuid() }
      books = books.concat(book)
      if (
        authors.findIndex(
          author =>
            author.name.toLocaleLowerCase() === book.author.toLocaleLowerCase()
        ) === -1
      ) {
        authors = authors.concat({ name: book.author, id: uuid() })
      }
      return book
    },
    editAuthorBirth: (root, { name, setBornTo }) => {
      const author = authors.find(author => {
        return author.name.toLocaleLowerCase() === name.toLocaleLowerCase()
      })
      if (author) {
        author.born = setBornTo
      }
      return author
    }
  }
}

module.exports = { typeDefs, resolvers }
