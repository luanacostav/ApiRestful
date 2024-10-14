const express = require('express')
const cors = require('cors')
const pg = require('pg')
const { Pool } = pg
const port = 9000

app = express()
app.use(express.json())
app.use(cors())

const pool = new Pool({
  user: 'postgres',
  port: 5432,
  host: 'localhost',
  database: 'users',
  password: '*your password*'
})

// CREATE TABLE
async function createTable() {
  const create = await pool.query(
    `CREATE TABLE IF NOT EXISTS usuario(
      id SERIAL PRIMARY KEY,
      nome VARCHAR(100),
      idade INTEGER,
      email VARCHAR(100)
    )`
  )
  console.log('Tabela criada!')
}

// createTable()

// READ USERS
app.get('/usuarios', async (req, res) => {
  try {
    const getUser = await pool.query(
      `SELECT * FROM usuario`
    )
    console.log(getUser.rows)
    res.status(200).json(getUser.rows)

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

// FIND USER
app.get('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params
    const getUser = await pool.query(
      `SELECT * FROM usuario
      WHERE id = $1`, [id]
    )
    if (getUser.rows.length === 0) {
      return res.status(404).json({ message: "User não encontrado" })
    }
    res.status(200).json(getUser.rows[0])
  } catch (error){
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

// ADD NEW USER
app.post('/usuarios', async (req, res) => {
  try {
    const { nome, idade, email } = req.body
    const user = await pool.query(
      `INSERT INTO usuario (nome, idade, email)
      VALUES ($1, $2, $3) RETURNING *`, [nome, idade, email]
    )
    res.status(200).json(user.rows)

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})


// UPDATE
app.put('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { nome, idade, email } = req.body
    const updUser = await pool.query(
      `UPDATE usuario SET nome = $1, idade = $2, email = $3
      WHERE id = $4 RETURNING *`, [nome, idade, email, id]
    )
    if (updUser.rows.length === 0) {
      return res.status(404).json({ message: "User não encontrado" })
    }
    res.status(200).json(updUser.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE
app.delete('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params
    const dltUser = await pool.query(
      `DELETE FROM usuario
      WHERE id = $1 RETURNING *`, [id]
    )
    if (dltUser.rows.length === 0) {
      return res.status(404).json({ message: "User não encontrado" })
    }
    res.status(200).json(dltUser.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})


app.listen(port, (error) => {
  if (error) {
    console.log('ERROR')
  }
  console.log(`http://localhost:${port}`)
})
