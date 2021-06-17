/* eslint-disable no-console */
import express from 'express'
import next from 'next'
import logger from 'morgan'
import router from './server/router/router'

const port = parseInt(process.env.PORT, 10) || 8000
const env = process.env.NODE_ENV
const dev = env !== 'production'
const app = next({
  dir: '.', // base directory where everything is, could move to src later
  dev,
})

const handle = app.getRequestHandler()

let server
app
  .prepare()
  .then(() => {
      server = express()

      // Logs
      server.use(logger("dev"))

      // Router
      router(server, handle)

      server.use(express.json())
      server.use(
          express.urlencoded({
              extended: false,
          }),
      )

      server.listen(port, (err) => {
          if (err) {
              throw err
          }
          console.log(`
        > Ready on port ${port} [${env}]
        http://localhost:8000
      `)
      })
  })
  .catch((err) => {
    console.log('An error occurred, unable to start the server')
    console.log(err)
  })