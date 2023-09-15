const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

let initializeDBAndServer = async () => {
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

//API 1
const hasSearch = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};
const hasPriorityandStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const hasPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hasStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let selectedQuery = null;
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasSearch(request.query):
      selectedQuery = `SELECT *
            FROM todo
            WHERE todo LIKE '%${search_q}%';`;
      data = await db.all(selectedQuery);
      console.log(data);
      response.send(data);
      break;

    case hasPriorityandStatus(request.query):
      selectedQuery = `SELECT *
            FROM todo
            WHERE todo LIKE '%${search_q}%'
            AND status='${status}' AND priority='${priority}';`;
      data = await db.all(selectedQuery);
      response.send(data);
      break;
    case hasStatus(request.query):
      selectedQuery = `SELECT *
            FROM todo
            WHERE todo LIKE '%${search_q}%'
            AND status='${status}';`;
      data = await db.all(selectedQuery);
      response.send(data);
      break;
    case hasPriority(request.query):
      selectedQuery = `SELECT *
            FROM todo
            WHERE todo LIKE '%${search_q}%'
            AND priority='${priority}';`;
      data = await db.all(selectedQuery);
      response.send(data);
      break;
  }
});

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const idQuery = `SELECT * FROM todo
    WHERE id=${todoId};`;
  const dataQuery = await db.get(idQuery);
  console.log(dataQuery);
  response.send(dataQuery);
});

//API 3
app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const idQuery = `INSERT INTO todo
  (id,todo,priority,status)
  VALUES
  (${id},'${todo}','${priority}','${status}');`;
  const dataQuery = await db.run(idQuery);
  console.log(dataQuery);
  response.send("Todo Successfully Added");
});

//API 4
const convertStatus = (todo) => {
  return todo.status != undefined;
};
const convertPriority = (todo) => {
  return todo.priority != undefined;
};
const convertTodo = (todo) => {
  return todo.todo != undefined;
};
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoDetails = request.body;
  let updatedQuery = null;
  let data = null;
  switch (true) {
    case convertStatus(todoDetails):
      const { status } = todoDetails;
      updatedQuery = `UPDATE todo
            SET 
            status='${status}'
            WHERE id=${todoId}; `;
      data = await db.run(updatedQuery);
      response.send("Status Updated");
      break;
    case convertPriority(todoDetails):
      const { priority } = todoDetails;
      updatedQuery = `UPDATE todo
            SET 
            priority='${priority}'
            WHERE id=${todoId}; `;
      data = await db.run(updatedQuery);
      response.send("Priority Updated");
      break;
    case convertTodo(todoDetails):
      const { todo } = todoDetails;
      updatedQuery = `UPDATE todo
            SET 
            todo='${todo}'
            WHERE id=${todoId}; `;
      data = await db.run(updatedQuery);
      response.send("Todo Updated");
      break;
  }
});

//API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const Query = `DELETE FROM todo
    WHERE id=${todoId};`;
  await db.run(Query);
  response.send("Todo Deleted");
});

module.exports = app;
