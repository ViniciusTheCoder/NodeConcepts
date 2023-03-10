const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  if (!user) {
    return response.status(404).json({ error: "User not found!" });
  }
  request.user = user;
  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);
  if (userAlreadyExists) {
    return response.status(400).json({
      error: "user already exists!",
    });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };
  users.push(user);
  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(), 
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const findTodo = user.todos.find((todo) => todo.id === id);
  if (!findTodo) {
    return response.status(404).json({ error: "Todo not exists!" });
  }
  const { title, deadline } = request.body;
  const newTodo = {
    ...findTodo,
    title,
    deadline,
  };
  const newTodos = user.todos.map((todo) => {
    if (todo.id === findTodo.id) {
      return newTodo;
    }
    return todo;
  });
  user.todos = newTodos;
  return response.json(newTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const findTodo = user.todos.find((todo) => todo.id === id);
  if (!findTodo) {
    return response.status(404).json({ error: "Todo not exists!" });
  }
  const newTodo = {
    ...findTodo,
    done: true,
  };
  const newTodos = user.todos.map((todo) => {
    if (todo.id === findTodo.id) {
      return newTodo;
    }
    return todo;
  });
  user.todos = newTodos;
  return response.json(newTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const findTodo = user.todos.find((todo) => todo.id === id);
  if (!findTodo) {
    return response.status(404).json({ error: "Todo not fund!" });
  }

  const todoFiltered = user.todos.filter((todo) => todo.id !== findTodo.id);
  user.todos = todoFiltered;

  return response.status(204).send();
});

module.exports = app;