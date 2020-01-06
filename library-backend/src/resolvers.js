const {
  gql,
  UserInputError,
  AuthenticationError
} = require('apollo-server-express')
const Book = require('./models/Book')
const Author = require('./models/Author')
const User = require('./models/User')
const { getToken } = require('./utils/helper')

const typeDefs = gql`
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

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
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      published: Int
      author: String!
      genres: [String!]
    ): Book
    editAuthorBirth(name: String!, setBornTo: Int!): Author
    createUser(username: String!, favoriteGenre: String!): User
    login(username: String!, password: String!): Token
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
    allAuthors: () => Author.find({}),
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Author: {
    bookCount: async root => {
      return (await Book.find({ author: root.id })).length
    }
  },
  Mutation: {
    addBook: async (
      root,
      { title, published, author, genres },
      { currentUser }
    ) => {
      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }
      try {
        let existingAuthor = (
          await Author.find({
            name: { $regex: new RegExp(`^${author}$`, 'i') }
          })
        ).pop()
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
        const savedBook = await book.save()
        return await Book.findById(savedBook.id).populate('author')
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: { title, published, author, genres }
        })
      }
    },
    editAuthorBirth: async (root, { name, setBornTo }, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }
      try {
        const author = (
          await Author.find({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
          })
        ).pop()
        if (author) {
          author.born = setBornTo
          return author.save()
        }
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: { name, setBornTo }
        })
      }
      return null
    },
    createUser: async (root, { username, favoriteGenre }) => {
      const user = new User({ username, favoriteGenre })
      try {
        const savedUser = await user.save()
        return savedUser
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: { username }
        })
      }
    },
    login: async (root, { username, password }) => {
      return { value: await getToken({ username, password }) }
    }
  }
}

module.exports = { typeDefs, resolvers }
