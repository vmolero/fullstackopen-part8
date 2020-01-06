import React, { useState } from 'react'

const Login = ({ show, onLogin, onToken }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  if (!show) {
    return null
  }

  const submit = async e => {
    e.preventDefault()

    const response = await onLogin({
      variables: { username, password }
    })
    if (response) {
      const token = response.data.login.value
      onToken(token)
      localStorage.setItem('library-token', token)
    }
    setUsername('')
    setPassword('')
  }

  return (
    <div>
      <p>Valid users/passwords: ("victor", "1234") or ("daniel", "1234")</p>
      <form onSubmit={submit}>
        <div>
          username
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
          <input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )
}

export default Login
