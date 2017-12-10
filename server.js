
const actions = require('./actions')
const dbActions = require('./dbActions')
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const request = require('superagent')
const app = express()

app.set('port', (process.env.PORT || 12000))
app.use(express.static(path.join(__dirname, '/public')))
// app.use('/favicon', express.static(__dirname + '/public/favicon.ico'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/marketSummaries', actions.getMarketSummaries)
app.get('/getCurrencies', actions.getCurrencies)
app.get('/getHistory', actions.getHistory)
app.get('/charts', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/charts.html'))
})


process.on('uncaughtException', function (err) {
  console.error(err)
})

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'))
})
