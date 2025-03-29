const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null

const initialize = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3002, () =>
      console.log('Server running at http://localhost:3002/'),
    )
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initialize()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

// GET all players
app.get('/players/', async (request, response) => {
  const query = `SELECT * FROM cricket_team;`
  const players = await db.all(query)
  response.send(players.map(player => convertDbObjectToResponseObject(player)))
})

// POST a new player
app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const insertQuery = `
    INSERT INTO 
      cricket_team (player_name, jersey_number, role)
    VALUES (?, ?, ?);`
  await db.run(insertQuery, [playerName, jerseyNumber, role])
  response.send('Player Added to Team')
})

// GET player by ID
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const query = `SELECT * FROM cricket_team WHERE player_id = ?;`
  const player = await db.get(query, [playerId])
  response.send(convertDbObjectToResponseObject(player))
})

// PUT update player by ID
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = request.body
  const updateQuery = `
    UPDATE cricket_team
    SET 
      player_name = ?, 
      jersey_number = ?, 
      role = ?
    WHERE 
      player_id = ?;`
  await db.run(updateQuery, [playerName, jerseyNumber, role, playerId])
  response.send('Player Details Updated')
})

// DELETE player by ID
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deleteQuery = `DELETE FROM cricket_team WHERE player_id = ?;`
  await db.run(deleteQuery, [playerId])
  response.send('Player Removed')
})

module.exports = app
