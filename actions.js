const request = require('superagent')
const dbActions = require('./dbActions')
const async = require('async')
const btAPIBase = 'https://bittrex.com/api/v1.1/market/'
const btAcctBase = 'https://bittrex.com/api/v1.1/account/'

const bittrex = require('node-bittrex-api')
bittrex.options({})

let marketData

dbActions.getMarkets((mongoMarks) => {
  marketData = mongoMarks
})

exports.getMarkets = getMarkets

function processResults (incomingResponse, response, markets) {
  let clonedResult = incomingResponse
  clonedResult.map((ac) => {
    const dayRange = (ac.High - ac.Low) / ac.Low * 100
  //  const percdown = (ac.Last - ac.Low) / ac.Low * 100
    const sellPressure = (ac.OpenSellOrders / ac.Volume) * 100
    const buyPressure = (ac.OpenBuyOrders / ac.Volume) * 100
  //  ac.sellPressure = sellPressure.toFixed(2) + '%'
  //  ac.buyPressure = buyPressure.toFixed(2) + '%'
    ac.dayRange = dayRange.toFixed(2)
    Object.keys(ac).map((key) => {
      if (typeof ac[key] === 'number') {
        if (key === 'Volume') {
          ac[key] = ac[key].toFixed(0).replace(/\.?0+$/,'')
        } else {
          ac[key] = ac[key].toFixed(12).replace(/\.?0+$/,'')
        }
      }
    })
    if (Array.isArray(markets)) {
      markets.map((ma) => {
        if (ma.MarketName === ac.MarketName) {
          const down30 = ((ac.Last - ma.thirtyDayLow) / ma.thirtyDayLow) * 100
          const range30 = ((ma.thirtyDayHigh - ma.thirtyDayLow) / ma.thirtyDayLow) * 100
          ac.MarketCurrencyLong = ma.MarketCurrencyLong
        //  ac.Logo = ma.LogoUrl
        //  ac.IsActive = ma.IsActive
          ac.thirtyDayHigh = ma.thirtyDayHigh
          ac.down30 = down30.toFixed(2) + '%'
          ac.range30 = range30.toFixed(2) + '%'
          ac.closeToLow = (ac.Last - ac.Low)/ac.Low
        }
      })
    }
    delete ac.Created
    delete ac.TimeStamp
    delete ac.Bid
    delete ac.BaseVolume
    delete ac.OpenSellOrders
    delete ac.OpenBuyOrders
    delete ac.Ask
    delete ac.PrevDay
  })
  clonedResult = clonedResult.filter((obj) => (obj.dayRange > 5 && obj.MarketName.startsWith('BTC-')))
  response.status(200).send(clonedResult)
}

exports.getMarketSummaries = (req, response) => {
  const btAPI = 'https://bittrex.com/api/v1.1/public/getmarketsummaries'
  request
   .get(btAPI)
   .end((err, res) => {
     if (err) console.error(err)
     processResults(res.body.result, response, marketData)
   })
}

function getMarkets (callback) {
  const btAPI = 'https://bittrex.com/api/v1.1/public/getmarkets'
  request.get(btAPI).end((err, res) => {
    if (err) console.error(err)
    callback(res.body.result)
  })
}

exports.getCurrencies = (req, response) => {
  const btAPI = 'https://bittrex.com/api/v1.1/public/getCurrencies'
  request.get(btAPI).end((err, res) => {
    if (err) console.error(err)
    response.status(200).send(res.body.result)
  })
}

exports.getHistory = (req, res) => {
    const interval = req.query.timePeriod || 'day'
    bittrex.getcandles({
    marketName: req.query.market,
    _: 1503680400,
    tickInterval: interval, //  'oneMin', 'fiveMin', 'thirtyMin, 'hour', 'day'.
  }, function( data, err ) {
      res.status(200).send(data.result)
  })
}

exports.getTicks = (market, callback) => {
  bittrex.getticker( { market : market }, function( ticker ) {
   callback(ticker)
  })
}
