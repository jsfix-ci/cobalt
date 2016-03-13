import express from 'express'
import mongoose from 'mongoose'
import winston from 'winston'
import courses from './api/courses'
import buildings from './api/buildings'
import db from './db'

let test = process.argv.join().match('/ava/')
let enableSync = process.env.COBALT_ENABLE_DB_SYNC || true

// Database connection setup
mongoose.connect(process.env.COBALT_MONGO_URI || 'mongodb://localhost/cobalt', err => {
  if (err) throw new Error(`Failed to connect to MongoDB [${process.env.COBALT_MONGO_URI}]: ${err.message}`)
  if (!test) {
    winston.info('Connected to MongoDB')
  }
})

// Express setup
let app = express()

// Database sync keeper
if (!test && enableSync) {
  db.syncCron()
}

// API routes
let apiVersion = '1.0'
app.use(`/${apiVersion}/courses`, courses)
app.use(`/${apiVersion}/buildings`, buildings)

// Error handlers
app.use((req, res, next) => {
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

app.use((err, req, res, next) => {
  res.status(err.status || 500)
  let error = {
    code: err.status,
    message: err.message
  }
  res.json({
    error: error
  })
})

module.exports = {
  Server: app
}
