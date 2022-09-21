const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username) 

  if (!user){
    return response.status(404).json({error: 'Usuário não existe!'})
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username} = request.body

  const userAlreadyExist = users.find(user => user.username === username)

  if (userAlreadyExist) {
    return response.status(400).json({error: 'Usuário já existe!'})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const { title, deadline } = request.body

  const todoById = user.todos.find((todo) => todo.id === id)

  if (!todoById) {
    return response.status(404).json({error: 'Não existe esse todo'})
  }

  todoById.title = title
  todoById.deadline = new Date(deadline)

  return response.json(todoById)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todoById = user.todos.find((todo) => todo.id === id)

  if (!todoById) {
    return response.status(404).json({error: 'Não existe esse todo'})
  }

  todoById.done = true

  return response.json(todoById)
  
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todoById = user.todos.find((todo) => todo.id === id)

  if (!todoById) {
    return response.status(404).json({error: 'Não existe esse todo'})
  }

  user.todos.splice(todoById, 1)

  return response.status(204).json()

});

module.exports = app;