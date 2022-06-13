const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketTeam.db");
const app = express();
app.use(express.json());

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const convertDBObjectToResponseObject = (dbObject) => {
  return {
    playerID: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
//API to get all players details
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      cricket_team
    ORDER BY
      player_id;`;
  const playerArray = await db.all(getPlayersQuery);

  response.send(playerArray.map(convertDBObjectToResponseObject));
});
//API for add new player to the table
app.post("/players/", async (request, response) => {
  let playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
      INSERT INTO
        cricket_team (player_name,jersey_number,role)
      VALUES ('${playerName}',${jerseyNumber},'${role}');
    `;
  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//API for getting one player for given playerId
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
        SELECT * FROM cricket_team
        WHERE 
            player_id=${playerId};
    `;
  const player = await db.get(getPlayerQuery);

  response.send(convertDBObjectToResponseObject(player));
});
//API for update player Details of given playerId
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
         UPDATE
            cricket_team 
        SET
            player_name='${playerName}',
            jersey_number=${jerseyNumber},
            role='${role}'
        WHERE
            player_id=${playerId};
    `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//API for delete player of given playerId
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
        DELETE
            FROM cricket_team
        WHERE 
            player_id=${playerId};
    `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
module.exports = app;
