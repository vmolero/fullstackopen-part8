const { gql } = require('apollo-server')
const Book = require('./models/Book')
const Author = require('./models/Author')

const books = require('./tests/fixtures/books')
const authors = require('./tests/fixtures/authors')

const typeDefs = gql`
  type Book {
    title: String!
    published: Int
    genres: [String!]
    author: Author!
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
    addBook: async (root, { title, published, author, genres }) => {
      let existingAuthor = (await Author.find({ name: author })).pop()
      if (!existingAuthor) {
        const newAuthor = new Author({ name: author })
        existingAuthor = await newAuthor.save()
      }
      const book = new Book({
        title,
        published,
        author: existingAuthor,
        genres
      })
      return book.save()
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
