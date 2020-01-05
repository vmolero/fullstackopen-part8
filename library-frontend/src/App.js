import React, { useState } from 'react'
import { useQuery, useMutation } from 'react-apollo'
import { gql } from 'apollo-boost'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'

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
      author
      published
      id
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
      author
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
  const allAuthorsResults = useQuery(ALL_AUTHORS)
  const allBooksResults = useQuery(ALL_BOOKS)
  const [addBook] = useMutation(ADD_BOOK, {
    onError: error => console.log(error),
    refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }]
  })

  const [editAuthorBirth] = useMutation(EDIT_AUTHOR_BIRTH, {
    onError: error => console.log(error),
    refetchQueries: [{ query: ALL_AUTHORS }]
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
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <Authors
        show={page === 'authors'}
        authors={getQueryData(allAuthorsResults, 'allAuthors')}
        onEditAuthorBirth={editAuthorBirth}
      />

      <Books
        show={page === 'books'}
        books={getQueryData(allBooksResults, 'allBooks')}
      />

      <NewBook show={page === 'add'} onAddBook={addBook} />
    </div>
  )
}

export default App
