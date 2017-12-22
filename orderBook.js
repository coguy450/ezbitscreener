const bittrex = require('node-bittrex-api')
const BittrexOrderBook = require('bittrex-orderbook')
const wsuri = 'wss://api.poloniex.com'
const Poloniex = require('poloniex-api-node');
const main = require('./server')

const bit = new BittrexOrderBook;

exports.newWSConnection = (message, ws) => {
  startAsks(message, ws)
  startBids(message, ws)
}


function startAsks(market, thisWS) {
  bit.market(market).on('askUpdate', (data) => {
    let lastAskUpdate = {asks: data.asks.top(10), market: market}
    if (thisWS.readyState === 1) {
      thisWS.send(JSON.stringify(lastAskUpdate))
    } else {
      thisWS.terminate()
    }
  });
}

// function newTicker(market, socket) {
//   bittrex.websockets.client(function() {
//     bittrex.websockets.subscribe([market], function(data) {
//       console.log(data)
//       data.A.forEach(function(data_for) {
//         data_for.Deltas.forEach(function(marketsDelta) {
//           console.log('Ticker Update for '+ marketsDelta.MarketName, marketsDelta);
//         })
//       })
//     })
//   })
// }

function startBids(market, thisWS) {
  bit.market(market).on('bidUpdate', (data) => {
    let lastBidUpdate = {bids: data.bids.top(10), market: market}
    if (thisWS.readyState === 1) {
      thisWS.send(JSON.stringify(lastBidUpdate))
    } else {
      thisWS.terminate()
    }
  })
}
