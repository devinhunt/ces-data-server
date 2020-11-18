const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const express = require('express')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 3000

const getCsvPath = sourceKey => path.resolve(__dirname, `data-${sourceKey}.csv`)
const getSheetsUrl = docId => `https://docs.google.com/spreadsheets/d/${docId}/pub?output=csv`

let dataFetched = false

const dataRoutes = [
  ['default', `1VM2N68-aAGp8_WWvxtcEvgGf9YBwW3AzXB4Q2xEynLA`],
  //['trend', `1yktDnFm9ToJkLs4GKGuvYSBzmXroQEDfSuoCFcNMcZE`],
  ['policy', `1iZf2Y0w43WGmqgiCkpwpje4XxRIyDubW6rYKt1UWSS4`]
]

async function fetchData() {

  await Promise.all(dataRoutes.map( async ([key, sheetId]) => {
    const dataUri = getSheetsUrl(sheetId)
    const response = await fetch(dataUri)
    const body = await response.text()

    fs.writeFileSync(getCsvPath(key), body)
    console.log(`--- Data source ${key} update at ${new Date().toUTCString()}`)  
  }))

  console.log('All sources updated at', new Date().toUTCString())
  dataFetched = true

  // Check for updates every 5 minutes
  setTimeout(() => fetchData(), 5 * 60 * 1000)
}

// kickoff fetching
( async () => fetchData() )()

app.get('/', (req, res) => res.status(501).send('Invalid request'))

app.get('/data/:source', cors(), (req, res) => {
  if(dataFetched) {
    res.download(getCsvPath(req.params.source))
  } else {
    res.status(500).send('Data not present')
  }  
})

app.listen(port, () => console.log(`CES Data Server listening on ${port}`))
