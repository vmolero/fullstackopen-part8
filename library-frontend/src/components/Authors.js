import React, { useState } from 'react'
import Select from 'react-select'

const Authors = ({ authors, show, onEditAuthorBirth }) => {
  const [name, setName] = useState('')
  const [birth, setBirth] = useState('')
  if (!show) {
    return null
  }

  const onChange = selectedOption => {
    setName(selectedOption.value)
  }

  const onSubmit = async evt => {
    evt.preventDefault()
    await onEditAuthorBirth({ variables: { name, setBornTo: parseInt(birth) } })
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map(a => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Set birth year</h2>
      <form onSubmit={onSubmit}>
        <div>
          <Select
            value={{ label: name, value: name }}
            onChange={onChange}
            options={authors.reduce((carry, author) => {
              return [...carry, { value: author.name, label: author.name }]
            }, [])}
          />
        </div>
        <div>
          birth year
          <input
            value={birth}
            onChange={({ target }) => setBirth(target.value)}
          />
        </div>
        <button type="submit">edit birth year</button>
      </form>
    </div>
  )
}

export default Authors
