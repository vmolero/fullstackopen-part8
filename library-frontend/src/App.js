import React, { useState, useEffect } from 'react'
import {
  useQuery,
  useMutation,
  useApolloClient,
  useSubscription
} from 'react-apollo'
import { gql } from 'apollo-boost'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import EditBirth from './components/EditBirth'
import Recommend from './components/Recommended'

const BOOK_FRAGMENT = gql`
  fragment BookDetails on Book {
    title
    author {
      name
    }
    published
    genres
    id
  }
`

const ALL_AUTHORS = gql`
  {
    allAuthors {
      name
      born
      id
      bookCount
    }
  }
`

const ALL_BOOKS = gql`
  {
    allBooks {
      ...BookDetails
    }
  }
  ${BOOK_FRAGMENT}
`

const ME = gql`
  {
    me {
      username
      favoriteGenre
    }
  }
`

const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`

const GENRES = gql`
  {
    distinctGenres
  }
`

const ADD_BOOK = gql`
  mutation addBook(
    $title: String!
    $author: String!
    $genres: [String!]
    $published: Int
  ) {
    addBook(
      title: $title
      author: $author
      genres: $genres
      published: $published
    ) {
      id
      title
      author {
        name
        born
      }
      genres
      published
    }
  }
`

const EDIT_AUTHOR_BIRTH = gql`
  mutation editAuthorBirth($name: String!, $setBornTo: Int!) {
    editAuthorBirth(name: $name, setBornTo: $setBornTo) {
      name
      born
      id
    }
  }
`

const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  ${BOOK_FRAGMENT}
`

function isQueryReady(results, queryName) {
  return 'data' in results && results.data && queryName in results.data
}

function getQueryData(results, queryName) {
  if (isQueryReady(results, queryName)) {
    return results.data[queryName]
  }
  return null
}

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const [me, setMe] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const client = useApolloClient()

  useEffect(() => {
    const savedToken = localStorage.getItem('library-token')
    if (savedToken) {
      setToken(savedToken)
    }
  }, [])

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  const handleError = error => {
    setErrorMessage(error.graphQLErrors[0].message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  const updateCacheWith = (element, query, updateFn) => {
    const dataInStore = client.readQuery({ query })
    if (updateFn(dataInStore, element)) {
      client.writeQuery({
        query,
        data: dataInStore
      })
    }
  }

  const updateBooksCache = newBook => {
    return updateCacheWith(newBook, ALL_BOOKS, (store, addedBook) => {
      const includedIn = (set, object) => set.map(p => p.id).includes(object.id)
      if (!includedIn(store.allBooks, addedBook)) {
        store.allBooks = [...store.allBooks].concat(addedBook)
        return true
      }
      return false
    })
  }

  useQuery(ME, {
    onError: handleError,
    onCompleted: response => {
      setMe(response.me)
    }
  })

  const genresResult = useQuery(GENRES, {
    onError: handleError
  })
  const allAuthorsResults = useQuery(ALL_AUTHORS, {
    onError: handleError
  })
  const allBooksResults = useQuery(ALL_BOOKS, {
    onError: handleError
  })

  const [addBook] = useMutation(ADD_BOOK, {
    onError: handleError,
    onCompleted: () => {
      setPage('books')
    },
    update: (store, addBookResult) => {
      const newBook = getQueryData(addBookResult, 'addBook')
      updateBooksCache(newBook)
    }
  })
  const [editAuthorBirth] = useMutation(EDIT_AUTHOR_BIRTH, {
    onError: handleError,
    onCompleted: () => {
      setPage('authors')
    }
  })
  const [loginHandler] = useMutation(LOGIN, {
    onError: handleError,
    onCompleted: () => setPage('books'),
    refetchQueries: [
      {
        query: ME
      }
    ]
  })

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const newBook = subscriptionData.data.bookAdded
      updateBooksCache(newBook)
    }
  })

  if (
    !isQueryReady(allAuthorsResults, 'allAuthors') ||
    !isQueryReady(allBooksResults, 'allBooks') ||
    !isQueryReady(genresResult, 'distinctGenres')
  ) {
    return <p>Loading data ...</p>
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? (
          <>
            {me ? (
              <button onClick={() => setPage('recommend')}>recommended</button>
            ) : null}
            <button onClick={() => setPage('edit')}>edit year</button>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => logout()}>logout</button>
            {me ? <span>Logged as {me.username}</span> : null}
          </>
        ) : (
          <button onClick={() => setPage('login')}>login</button>
        )}
      </div>
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}

      <Login
        show={page === 'login' && !token}
        onLogin={loginHandler}
        onToken={userToken => setToken(userToken)}
      />

      <Authors
        show={page === 'authors'}
        authors={getQueryData(allAuthorsResults, 'allAuthors')}
      />

      <Books
        show={page === 'books'}
        books={getQueryData(allBooksResults, 'allBooks')}
        genres={getQueryData(genresResult, 'distinctGenres')}
      />

      <Recommend
        show={page === 'recommend' && me}
        books={getQueryData(allBooksResults, 'allBooks')}
        user={me}
      />

      <NewBook show={page === 'add'} onAddBook={addBook} />

      <EditBirth
        show={page === 'edit'}
        authors={getQueryData(allAuthorsResults, 'allAuthors')}
        onEditAuthorBirth={editAuthorBirth}
      />
    </div>
  )
}

export default App
