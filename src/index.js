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
    return response.status(400).json({error: 'Usuário não existe!'})
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

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  })

  return response.status(201).send()
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  user.todos.push({
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  })

  return response.status(200).json(user.todos)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const { title, deadline } = request.body

  const todoById = user.todos.find((todo) => todo.id === id)
  todoById.title = title
  todoById.deadline = deadline

  return response.status(201).send()

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todoById = user.todos.find((todo) => todo.id === id)
  todoById.done = true

  return response.json(todoById)
  
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todoById = user.todos.find((todo) => todo.id === id)

  user.todos.splice(todoById, 1)

  return response.json(user.todos)

});

module.exports = app;