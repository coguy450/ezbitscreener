const bittrex = require('node-bittrex-api')
const BittrexOrderBook = require('bittrex-orderbook')
const wsuri = 'wss://api.poloniex.com'
const Poloniex = require('poloniex-api-node');
const request = require('superagent')
const main = require('./server')
const async = require('async')

const bit = new BittrexOrderBook;

exports.newWSConnection = (message, ws) => {
  startAsks(message, ws)
  startBids(message, ws)
}


function startAsks(market, thisWS) {
  bit.market(market).on('askUpdate', (data) => {
    let lastAskUpdate = {asks: data.asks.top(10), market: market}
    if (thisWS.readyState === 1) {
      getPolOrders(market, lastAskUpdate).then((combBook) => {
        thisWS.send(JSON.stringify(combBook))
      })
    } else {
      thisWS.terminate()
    }
  })
}


function startBids(market, thisWS) {
  bit.market(market).on('bidUpdate', (data) => {
    let lastBidUpdate = {bids: data.bids.top(10), market: market}
    if (thisWS.readyState === 1) {
      getPolOrders(market, lastBidUpdate).then((combBook) => {
        thisWS.send(JSON.stringify(combBook))
      })
    } else {
      thisWS.terminate()
    }
  })
}


function getPolOrders (market, bOrd) {
  const polMarket = market.replace('-', '_')
  const pApi = `https://poloniex.com/public?command=returnOrderBook&currencyPair=${polMarket}&depth=10`
  return new Promise((resolve, reject) => {
    request
     .get(pApi)
     .end((err, res) => {
       if (err) {
         reject(err.text)
       } else {
         processBothOBs(res.body, bOrd).then((comb) => {
           resolve(comb)
         })
       }
     })
  })
}

function processBothOBs (polOB, bOB) {
  return new Promise((resolve, reject) => {
   let combinedBook = bOB
    const bookType = combinedBook.bids ?  'bids' : 'asks'
    async.forEach(polOB[bookType], (a, done) => {
      let matchFound = false
      combinedBook[bookType].map((b) => {
        if (parseFloat(a[0]) === b.rate) {
          b.quantity = b.quantity + parseFloat(a[1])
          b.exchange = 'both'
          matchFound = true
          done()
        }
      })
      if (!matchFound) {
        combinedBook[bookType].push({rate: a[0], quantity: a[1], exchange: 'Poloniex'})
        done()
      }
    }, () => {
      resolve(combinedBook)
    })
  })
}
