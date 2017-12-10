function  doSort (field, reverse, primer) {
  var key = primer ? function (x) { return primer(x[field]) } : function (x) { return x[field] }
  reverse = !reverse ? 1 : -1;
  return function (a, b) {
    return a = key(a), b = key(b), reverse * ((a > b) - (b > a))
  }
}

Vue.component('demo-grid', {
  template: '#grid-template',
  data: function () {
    return {
      sortKey: 'MarketName',
      sortOrders: {},
      gridData: null,
      gridColumns: null,
      thirtyDayHigh: null,
      thirtyDayLow: null,
      bitcoinValue: null,
      alertAmt: null,
      bitCoin50: null,
      reversed: false,
    }
  },
  methods: {
    sortBy: function (key) {
      let reverse, floater
      if (this.sortKey === key && !this.reversed) {
        reverse = true
        this.reversed = true
      } else if (this.sortKey === key && this.reversed) {
        reverse = false
        this.reversed = false
      } else {
        reverse = false
        this.reversed = false
      }

      if (key === 'MarketName' || key === 'MarketCurrencyLong') {
        floater = null
      } else {
        floater = parseFloat
      }
      this.gridData.sort(doSort(key, reverse, floater))
      this.sortKey = key
    },
    getCurrencies: function () {
      this.$http.get('/getCurrencies').then(response => {
        this.gridColumns = Object.keys(response.data[0])
        this.gridData = response.data
      }, (err) => {
        console.log(err)
      })
    },

    getSummaries: function () {
      this.$http.get('/marketSummaries').then(response => {
        console.log(response.data)
        this.gridColumns = Object.keys(response.data[0])
        this.gridData = response.data
      }, (err) => {
        console.log(err)
      })
    },
    getHistory: function (market) {
      console.log(market)
      this.currentMarket = market.MarketCurrencyLong
      this.$http.get('/getHistory?market=' + market.MarketName).then(response => {
        console.log(response.data)
        this.gridColumns = Object.keys(response.data.filteredDates[0])
        this.gridData = response.data.filteredDates
        this.thirtyDayLow = response.data.thirtyDayLow
        this.thirtyDayHigh = response.data.thirtyDayHigh
        this.thirtyDayRange = (this.thirtyDayHigh - this.thirtyDayLow)/this.thirtyDayLow * 100
        this.thirtyDayRange = this.thirtyDayRange.toFixed(2) + '%'
      }, (err) => {
        console.log(err)
      })
    },
    getBitcoinValue: function () {
      this.gridData.map((m) => {
        if (m.MarketName === 'USDT-BTC') {
          this.bitcoinValue = m.Last
        }
      })
    },
    doBuy: function (market) {
      if (market.buyPrice) {
        if (parseFloat(market.buyPrice) <= parseFloat(market.Last)) {
          const buyQuantity = this.bitCoin50 / market.Last
          console.log('doing buy', market, this.bitCoin50)
          this.$http.get(`/makeOrder?market=${market.MarketName}&quantity=${buyQuantity}&price=${market.buyPrice}`)
          .then(response => {
            console.log(response)
            market.buyPrice = 'BOUGHT!!'
          })
        }
      }
    },
    setAlert: function () {
      console.log('setting alert at', this.alertAmt)
    },
    doFakeBuy: function (market) {
      const bcValue = this.getBitcoinValue()
      this.$http.get(`/doFakeBuy?market=${market.MarketName}&bcValue=${this.bitcoinValue}&price=${market.Last}`)
      .then(response => {
        console.log(response)
      })
    }
  },
  created: function () {
    this.$http.get('/marketSummaries').then(response => {
      this.gridColumns = Object.keys(response.data[0])
      this.gridData = response.data
    }, (err) => {
      console.log(err)
    })

  }
})

// bootstrap the demo
var demo = new Vue({
  el: '#demo',
  data: {
    searchQuery: '',
    gridData: null,
    gridColumns: null
  }
})

var mainApp = new Vue({
  el: '#mainApp',
  data: {
    accountBalances: null
  },
  created: function () {
    // this.$http.get('/getBalances').then(response => {
    //   this.accountBalances = response.data.result
    // }, (err) => {console.error(err)})
  }
})
