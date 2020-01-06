import React, { useState } from 'react'

const Books = ({ books, genres, show }) => {
  const [filter, setFilter] = useState(null)
  const filterByGenre = genre => () => {
    setFilter(genre)
  }

  if (!show) {
    return null
  }
  return (
    <div>
      <h2>books</h2>
      <h3>
        {filter ? (
          <>
            in genre <strong>{filter}</strong>
          </>
        ) : (
          <>
            in <strong>all</strong> genres
          </>
        )}
      </h3>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books
            .filter(book => (filter ? book.genres.includes(filter) : true))
            .map(a => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            ))}
        </tbody>
      </table>
      {genres.map(genre => (
        <button key={genre} onClick={filterByGenre(genre)}>
          {genre}
        </button>
      ))}
      <button onClick={filterByGenre(null)}>All genres</button>
    </div>
  )
}

export default Books
