const { gql } = require('apollo-server')
const Book = require('./models/Book')
const Author = require('./models/Author')

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
    bookCount: () => Book.count(),
    authorCount: () => Author.count(),
    allBooks: async (root, { genre }) => {
      let criteria = {}
      if (genre) {
        criteria = { genres: { $in: [genre] } }
      }
      const books = await Book.find(criteria)
      return await Promise.all(
        books.map(book => Book.findById(book.id).populate('author'))
      )
    },
    allAuthors: () => Author.find({})
  },
  Author: {
    bookCount: async root => {
      return (await Book.find({ author: root.id })).length
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
    editAuthorBirth: async (root, { name, setBornTo }) => {
      const author = (
        await Author.find({
          name: { $regex: new RegExp(name, 'i') }
        })
      ).pop()
      if (author) {
        author.born = setBornTo
        return author.save()
      }
      return null
    }
  }
}

module.exports = { typeDefs, resolvers }
