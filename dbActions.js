const MongoClient = require('mongodb').MongoClient
const request = require('superagent')
const actions = require('./actions')
const async = require('async')
// const connectionString = process.env.PROD_MONGODB ? process.env.PROD_MONGODB : 'mongodb://localhost/bitcoin'
const connectionString = 'mongodb://bitcoinNodeApp:dzwBgvX7syuVCLqm2Ash@ds123956.mlab.com:23956/bitcoin'

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
