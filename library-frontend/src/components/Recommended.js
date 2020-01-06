import React from 'react'

const Recommend = ({ books, user, show }) => {
  if (!show) {
    return null
  }
  return (
    <div>
      <h2>recommendations</h2>
      <h3>books in your favourite genre {user.favoriteGenre}</h3>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books
            .filter(book => book.genres.includes(user.favoriteGenre))
            .map(a => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommend
