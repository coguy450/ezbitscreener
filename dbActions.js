const MongoClient = require('mongodb').MongoClient
const request = require('superagent')
const actions = require('./actions')
const async = require('async')
// const connectionString = process.env.PROD_MONGODB ? process.env.PROD_MONGODB : 'mongodb://localhost/bitcoin'
const connectionString = 'mongodb://bitcoinNodeApp:dzwBgvX7syuVCLqm2Ash@ds123956.mlab.com:23956/bitcoin'
const clURL = 'https://www.cryptocompare.com/api/data/CoinList'

let thisDB

const conMongo = ((callback) => {
  if (!thisDB) {
    MongoClient.connect(connectionString, (err, db) => {
      if (err) console.log(err);
        thisDB = db;
        callback(thisDB);
    })
  } else {
    callback(thisDB);
  }
})

exports.getMarkets = (callback) => {
  conMongo((db) => {
    const col = db.collection('markets')
    const whichFields = {_id: 0, BaseCurrencyLong: 0, BaseCurrency: 0, BaseMarket: 0, MinTradeSize: 0, Created:0, Notice: 0, isSponsored: 0}
    col.find({},whichFields ).toArray((err, results) => {
      callback(results)
    })
  })
}

exports.saveCoinList = ((req, res) => {
  request
   .get(clURL)
   .end((err, data) => {
     if (err) console.error(err)
     //res.status(200).send(data.body.Data)
    // console.log(Object.keys(data.body.Data))

     conMongo((db) => {
       const col = db.collection('coinList')
       Object.keys(data.body.Data).map((key) => {
         const coin = data.body.Data[key]
         delete coin.SortOrder
         delete coin.FullyPremined
         delete coin.TotalCoinsFreeFloat
         delete coin.PreMinedValue
         delete coin.ProofType
         col.update({Id: coin.Id}, coin, {upsert: true}, (err, result) => {
           console.log('added', coin.Name)
         })
       })
     })
     res.status(200).send('done')
   })
})
