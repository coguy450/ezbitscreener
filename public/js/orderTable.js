   var mainApp = new Vue({
     el: '#orders',
     data: {
       accountBalances: null,
       currentMarket: null,
       savedData: null,
       marketGot: null,
       loading: true,
       bidData: [],
       askData: []
     },
     methods: {
       goOrders: function () {
         location.href = `/orders?cur=${this.currentMarket}`
       },
       gotBids: function (dataIn) {
          this.bidData = dataIn
       },
       gotAsks: function (dataIn) {
          this.askData = dataIn
       },
     },
     beforeDestroy: function () {
       this.exampleSocket.close()
     },
     created: function () {
       const host = location.origin.replace(/^http/, 'ws').toString()
       const exampleSocket = new WebSocket(host);
       this.exampleSocket = exampleSocket
       const bindGotBids = this.gotBids
       const bindGotAsks = this.gotAsks
       exampleSocket.onmessage = function (event) {
         const dataIn = JSON.parse(event.data)
         if (dataIn.bids) {
           bindGotBids(dataIn.bids)
         } else if (dataIn.asks) {
           bindGotAsks(dataIn.asks)
         }
       }

       this.currentMarket = window.location.search.split('=')[1] || 'USDT-BTC'
       exampleSocket.onopen = function (event) {
         exampleSocket.send(window.location.search.split('=')[1] || 'USDT-BTC')
       }
     }
   })
