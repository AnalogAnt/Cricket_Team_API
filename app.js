const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
let db = null;
const dbPath = path.join(__dirname, "cricketTeam.db");
const initialiseandStartDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server is Running");
    });
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};
initialiseandStartDB();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  let getAllPlayersQuery = "SELECT *  FROM cricket_team";
  let playerList = await db.all(getAllPlayersQuery);
  response.send(
    playerList.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

app.post("/players/", async (request, response) => {
  const details = request.body;
  const { playerName, jerseyNumber, role } = details;
  const addPlayerQuery = `
        INSERT INTO
            cricket_team(player_id,player_name,jersey_number,role)
        VALUES
            (
                '${playerName}',
                ${jerseyNumber},
                '${role}'
            );
    `;
  await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getSpecificQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
  const dbresp = await db.get(getSpecificQuery);
  response.send(convertDbObjectToResponseObject(dbresp));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerID } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updateQuery = `
        UPDATE
            cricket_team
        SET
            player_name ='${playerName}',
            jersey_number = ${jerseyNumber},
            role = '${role}'
        WHERE
            player_id = ${playerID};
    `;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerID1 } = request.params;
  const deleteQuery = `DELETE FROM cricket_team WHERE player_id = ${playerID1};`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});
module.exports = app;
