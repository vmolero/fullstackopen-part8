import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useApolloClient } from 'react-apollo'
import { gql } from 'apollo-boost'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import EditBirth from './components/EditBirth'

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
      title
      author {
        name
      }
      published
      id
    }
  }
`

const ME = gql`
  {
    me {
      username
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

  const allAuthorsResults = useQuery(ALL_AUTHORS, {
    onError: handleError
  })
  const allBooksResults = useQuery(ALL_BOOKS, {
    onError: handleError
  })

  const [addBook] = useMutation(ADD_BOOK, {
    onError: handleError,
    refetchQueries: [{ query: ALL_AUTHORS }, { query: ALL_BOOKS }]
  })
  const [editAuthorBirth] = useMutation(EDIT_AUTHOR_BIRTH, {
    onError: handleError,
    refetchQueries: [{ query: ALL_AUTHORS }]
  })
  const [loginHandler] = useMutation(LOGIN, {
    onError: handleError,
    onCompleted: () => setPage('books'),
    refetchQueries: [{ query: ALL_AUTHORS }, { query: ALL_BOOKS }]
  })

  if (
    !isQueryReady(allAuthorsResults, 'allAuthors') ||
    !isQueryReady(allBooksResults, 'allBooks')
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
            <button onClick={() => setPage('edit')}>edit year</button>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => logout()}>logout</button>
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
