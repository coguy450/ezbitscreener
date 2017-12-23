const bodyParser = require('body-parser')
const path = require('path')
const actions = require('./actions')
const dbActions = require('./dbActions')
const orderBook = require('./orderBook')
const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');

const app = express();

app.use(express.static(path.join(__dirname, '/public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws, req) {
  const location = url.parse(req.url, true)

  ws.on('message', function incoming(message) {
    console.log('received: %s', message)
    orderBook.newWSConnection(message, ws)
  })
  ws.on('close', function () {
    console.log('socket closed by client')
  })
})

const port = process.env.PORT || 14000

server.listen(port, function listening() {
  console.log('Listening on %d', server.address().port);
});

app.get('/marketSummaries', actions.getMarketSummaries)
app.get('/getCurrencies', actions.getCurrencies)
app.get('/getHistory', actions.getHistory)
app.get('/saveCoinList', dbActions.saveCoinList)
app.get('/charts', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/charts.html'))
})

app.get('/orders', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/orders.html'))
})


process.on('uncaughtException', function (err) {
  console.error(err)
})

// app.listen(app.get('port'), () => {
//   console.log('Node app is running on port', app.get('port'))
// })
