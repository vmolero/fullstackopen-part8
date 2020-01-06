const _ = require('lodash')
const { UserInputError, AuthenticationError } = require('apollo-server-express')
const { PubSub } = require('apollo-server')

const Book = require('./models/Book')
const Author = require('./models/Author')
const User = require('./models/User')
const { getToken } = require('./utils/helper')
const typeDefs = require('./schema')

const publisher = new PubSub()

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
    },
    distinctGenres: async () => {
      const books = await Book.find({})
      return _.uniq(books.map(book => book.genres).flat())
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
        publisher.publish('BOOK_ADDED', { bookAdded: savedBook })
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
  },
  Subscription: {
    bookAdded: {
      subscribe: () => publisher.asyncIterator(['BOOK_ADDED'])
    }
  }
}

module.exports = { typeDefs, resolvers }
