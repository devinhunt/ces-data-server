const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const express = require('express')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 3000

const CSV_PATH = path.resolve(__dirname, 'data.csv')
const sheetId = `1ZhwP0GZTz50myibSaWsMXOVQKx9DQaJO4rN1i58Rrjc` // Should prob be an enviroment var
const sheetsUrlTemplate = docId => `https://docs.google.com/spreadsheets/d/${docId}/pub?output=csv`
let dataFetched = false

async function fetchData() {
  const dataUri = sheetsUrlTemplate(sheetId)
  const response = await fetch(dataUri)
  const body = await response.text()

  fs.writeFileSync(CSV_PATH, body)

  console.log('Data updated at', new Date().toUTCString())
  dataFetched = true

  // Check for updates every minute
  setInterval(() => fetchData(), 1000 * 60)
}

// kickoff fetching
( async () => fetchData() )()

app.get('/', (req, res) => res.status(501).send('Invalid request'))

app.get('/data', cors(), (req, res) => {
  if(dataFetched) {
    res.download(CSV_PATH)
  } else {
    res.status(500).send('Data not present')
  }  
})

app.listen(port, () => console.log(`CES Data Server listening on ${port}`))
