import http from 'http'
import path from 'path'
import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'

import fs from 'fs'

import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { taskRoutes } from './api/task/task.routes.js'
import { setupSocketAPI } from './services/socket.service.js'

import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'

const app = express()
const server = http.createServer(app)

// Express App Config
app.use(cookieParser())
app.use(express.json())

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve('public')))
} else {
  const corsOptions = {
    origin: [
      'http://127.0.0.1:3000',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://localhost:5173',
    ],
    credentials: true,
  }
  app.use(cors(corsOptions))
}
app.all('*', setupAsyncLocalStorage)

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/task', taskRoutes)

setupSocketAPI(server)

// Make every unhandled server-side-route match index.html
// so when requesting http://localhost:3030/unhandled-route...
// it will still serve the index.html file
// and allow vue/react-router to take it from there

app.get('/**', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})

import { logger } from './services/logger.service.js'
const port = process.env.PORT || 3030

server.listen(port, () => {
  logger.info('Server is running on port: ' + port)
})

// data handling

// import { makeId, readJsonFile, writeJsonFile } from './services/util.service.js'

// writeUsers()

// function writeUsers() {
//   let tasks = readJsonFile('data/tasks.json')
//   console.log(tasks)
//   const formatedUsers = []

//   tasks.forEach((task) => {
//     const existingUser = formatedUsers.find(
//       (user) => user.fullname === task.taskOwner
//     )

//     if (existingUser) {
//       existingUser.tasksIds.push(task.id)
//     } else {
//       formatedUsers.push({
//         fullname: task.taskOwner,
//         id: makeId(),
//         tasksIds: [task.id],
//         password: '12345',
//         username: task.taskOwner,
//       })
//     }
//   })

//   console.log(formatedUsers)
//   writeJsonFile('data/users.json', formatedUsers)
// }
