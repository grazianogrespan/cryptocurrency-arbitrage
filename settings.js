//
// let boilerPlateMarket =
// {
//     marketName: '',
//     URL: '', //URL To Fetch API From.
//     toBTCURL: false, //URL, if needed for an external bitcoin price api.
//     last: function (data, coin_prices) { //Get the last price of coins in JSON data
//         return new Promise(function (res, rej) {
//             try {
//                 for (x in / of data) {
//                     price = ...;
//                     coin_prices[coinName][marketName] = price;
//                 }
//                 res(coin_prices);
//             }
//             catch (err) {
//                 rej(err);
//             }
//
//         })
//     },
//
//
// }
const request = require('request');
let markets = [

    // {
    //     marketName: 'cryptowatchAPI',
    //     URL: 'https://api.cryptowat.ch/markets/summaries', //URL To Fetch API From.
    //     toBTCURL: false, //URL, if needed for an external bitcoin price api.
    //
    //     last: function (data, coin_prices, toBTCURL) { //Where to find the last price of coin in JSON data
    //         return new Promise(function (res, rej) {
    //             try {
    //                 data = data.result;
    //                 for (let key in data) {
    //                     let marketPair = key.split(':');
    //                     let market = marketPair[0], pair = marketPair[1];
    //                     let indexOfBTC = pair.indexOf('btc');
    //                     if (indexOfBTC > 0 && !pair.includes('future') && !market.includes('qryptos') && !market.includes('quoine') && !market.includes('poloniex')) {
    //                         if(marketNames.indexOf(market) === -1 ){
    //                             marketNames.push([[market], ['']]);
    //                             console.log(marketNames);
    //                         }
    //                         let coin = pair.replace(/btc/i, '').toUpperCase();
    //                         let price = data[key].price.last;
    //                         if(price > 0) {
    //                             if (!coin_prices[coin]) coin_prices[coin] = {};
    //                             coin_prices[coin][market] = price;
    //
    //                         }
    //                     }
    //                 }
    //                 res(coin_prices);
    //             }
    //             catch (err) {
    //                 console.log(err);
    //                 rej(err)
    //             }
    //         })
    //     }
    //
    // },
    {
        enabled:true,
        marketName: 'bittrex',
        URL: 'https://bittrex.com/api/v1.1/public/getmarketsummaries',
        toBTCURL: false,
        pairURL : '',
        last: function (data, coin_prices) { //Where to find the last price of coin in JSON data
            return new Promise(function (res, rej) {
                try {
                    for (let obj of data.result) {
                        if(obj["MarketName"].includes('BTC-')) {
                            let coinName = obj["MarketName"].replace("BTC-", '');
                            if (!coin_prices[coinName]) coin_prices[coinName] = {};
                            coin_prices[coinName].bittrex = obj.Last;
                        }
                    }
                    res(coin_prices);
                }
                catch (err) {
                    console.log(err);
                    rej(err);
                }

            })
        },

    },

    {
        enabled:false,
        marketName: 'bitfinex',
        URL: 'https://api.bitfinex.com/v1/symbols',
        toBTCURL: false,
        pairURL : '',
        last: function (data, coin_prices) { //Where to find the last price of coin in JSON data
            return new Promise(function (res, rej) {
                try {
                    // console.log("Bitfinex",data);
                    // dadwadw
                    for (let pair of data) {

                        if(pair.includes('btc') && pair.match(/DASH|EOS|GNO|ETC|ETH|ICN|LTC|MLN|REP|XDG|XLM|XMR|XRP|ZEC/i)) {
                            setTimeout((function(pair){
                                return function(){
                                    // console.log("https://api.bitfinex.com/v1/ticker/"+pair);
                                    request("https://api.bitfinex.com/v1/ticker/"+pair, function (error, response, body) {
                                        try {
                                            let ticker = JSON.parse(body);
                                            let coinName = pair.replace("btc", '').toUpperCase();
                                            // console.log(coinName,ticker);
                                            if (!coin_prices[coinName]) coin_prices[coinName] = {};
                                            coin_prices[coinName].bitfinex = ticker.last_price;
                                        } catch (error) {
                                            console.log("Error getting JSON response from", options.URL, error); //Throws error
                                            reject(error);
                                        }
                                    });
                                }
                            })(pair),1000);
                        }
                    }
                    // console.log("Bitfinex",coin_prices);
                    res(coin_prices);
                }
                catch (err) {
                    console.log(err);
                    rej(err);
                }

            })
        },

    },
    /*
    {
        marketName: 'gdax',
        URL: 'https://api.gdax.com/products/',
        toBTCURL: false,
        pairURL : '',
        last: function (data, coin_prices) { //Where to find the last price of coin in JSON data
            return new Promise(function (res, rej) {
                try {
                    for (let obj of data) {
                        pair = obj.id;
                        if(pair.includes('BTC')) {
                            setTimeout((function(pair){
                                return function(){
                                    var req_options = {
                                      url: "https://api.gdax.com/products/"+pair+'/ticker',
                                      headers: {
                                        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
                                      }
                                    };
                                    request(req_options, function (error, response, body) {
                                        try {
                                            let ticker = JSON.parse(body);
                                            let coinName = pair.replace("BTC-", '');
                                            coinName = coinName.replace("-BTC", '');
                                            coinName = coinName.toUpperCase();

                                            if (!coin_prices[coinName]) coin_prices[coinName] = {};
                                            coin_prices[coinName].gdax = ticker.price;
                                        } catch (error) {
                                            console.log("Error getting JSON response from", options.URL, error); //Throws error
                                            reject(error);
                                        }
                                    });
                                }
                            })(pair),1000);
                        }
                    }
                    // console.log("Bitfinex",coin_prices);
                    res(coin_prices);
                }
                catch (err) {
                    console.log(err);
                    rej(err);
                }

            })
        },

    },
*/
    {
        enabled:true,
        marketName: 'bitstamp',
        URL: 'https://www.bitstamp.net/api/ticker/',
        toBTCURL: false,
        pairURL : '',
        last: function (data, coin_prices) { //Where to find the last price of coin in JSON data
            return new Promise(function (res, rej) {
                try {
                    let pairs = ['btcusd', 'btceur', 'eurusd', 'xrpusd', 'xrpeur', 'xrpbtc', 'ltcusd', 'ltceur', 'ltcbtc', 'ethusd', 'etheur', 'ethbtc', 'bchusd', 'bcheur', 'bchbtc'];
                    for (let pair of pairs) {
                        if(pair.includes('btc')) {
                            setTimeout((function(pair){
                                return function(){
                                    request("https://www.bitstamp.net/api/v2/ticker/"+pair, function (error, response, body) {
                                        try {
                                            let ticker = JSON.parse(body);
                                            let coinName = pair.replace("btc", '').toUpperCase();
                                            // console.log(coinName,ticker);
                                            if (!coin_prices[coinName]) coin_prices[coinName] = {};
                                            coin_prices[coinName].bitstamp = ticker.last;
                                        } catch (error) {
                                            console.log("Error getting JSON response from", options.URL, error); //Throws error
                                            reject(error);
                                        }
                                    });
                                }
                            })(pair),1000);
                        }
                    }
                    // console.log("Bitfinex",coin_prices);
                    res(coin_prices);
                }
                catch (err) {
                    console.log(err);
                    rej(err);
                }

            })
        },
    },

    {
        enabled:true,
        marketName: 'okcoin',
        URL: 'https://www.bitstamp.net/api/ticker/',
        toBTCURL: false,
        pairURL : '',
        last: function (data, coin_prices) { //Where to find the last price of coin in JSON data
            return new Promise(function (res, rej) {
                try {
                    let pairs = ['btc_usd', 'ltc_usd', 'eth_usd', 'etc_usd', 'bch_usd'];
                    for (let pair of pairs) {
                        if(pair.includes('btc')) {
                            setTimeout((function(pair){
                                return function(){
                                    request("https://www.okcoin.com/api/v1/ticker.do?symbol="+pair, function (error, response, body) {
                                        try {
                                            let ticker = JSON.parse(body);
                                            let coinName = pair.replace("btc", '').toUpperCase();
                                            // console.log(coinName,ticker);
                                            if (!coin_prices[coinName]) coin_prices[coinName] = {};
                                            coin_prices[coinName].okcoin = ticker.ticker.last;
                                        } catch (error) {
                                            console.log("Error getting JSON response from", options.URL, error); //Throws error
                                            reject(error);
                                        }
                                    });
                                }
                            })(pair),1000);
                        }
                    }
                    // console.log("Bitfinex",coin_prices);
                    res(coin_prices);
                }
                catch (err) {
                    console.log(err);
                    rej(err);
                }

            })
        },
    },

    {
        enabled:false,
        marketName: 'binance',
        URL: 'https://api.binance.com/api/v1/ticker/allPrices',
        toBTCURL: false,
        pairURL : '',
        last: function (data, coin_prices) { //Where to find the last price of coin in JSON data
            return new Promise(function (res, rej) {
                try {
                    for (let obj of data) {
                        if(obj["symbol"].includes('BTC')) {
                            let coinName = obj["symbol"].replace("BTC", '');
                            if (!coin_prices[coinName]) coin_prices[coinName] = {};
                            coin_prices[coinName].binance = obj.price;
                        }
                    }
                    res(coin_prices);
                }
                catch (err) {
                    console.log(err);
                    rej(err);
                }

            })
        },

    },

    {
        enabled:true,
        marketName: 'therocktrading',
        URL: 'https://api.therocktrading.com/v1/funds/tickers',
        toBTCURL: false,
        pairURL : '',
        last: function (data, coin_prices) { //Where to find the last price of coin in JSON data
            return new Promise(function (res, rej) {
                try {
                    for (let obj of data.tickers) {
                        if(obj["fund_id"].includes('BTC')) {
                            let coinName = obj["fund_id"].replace("BTC", '');
                            if (!coin_prices[coinName]) coin_prices[coinName] = {};
                            let price = obj.last;
                            if (coinName=='XRP')
                                price = 1/price;
                            coin_prices[coinName].therocktrading = price;
                        }
                    }
                    res(coin_prices);
                }
                catch (err) {
                    console.log(err);
                    rej(err);
                }

            })
        },

    },

    /*
    {
        marketName: 'btc38',
        URL: 'http://api.btc38.com/v1/ticker.php?c=all&mk_type=cny',
        toBTCURL: false,
        pairURL : '',
        last: function (data, coin_prices, toBTCURL) { //Where to find the last price of coin in JSON data
            return new Promise(function (res, rej) {
                let priceOfBTC = data.btc.ticker.last;
                try {
                    for (let key in data) {
                        let coinName = key.toUpperCase();
                        let price = data[key]['ticker'].last;
                        if (!coin_prices[coinName]) coin_prices[coinName] = {};

                        coin_prices[coinName]["btc38"] = data[key]['ticker'].last / priceOfBTC;
                    }
                    res(coin_prices);
                }

                catch (err) {
                    console.log(err);
                    rej(err)
                }
            })
        }
    },
    {
        marketName: 'jubi',
        URL: 'https://www.jubi.com/api/v1/allticker/', //URL To Fetch API From.
        toBTCURL: false, //URL, if needed for an external bitcoin price api.
        pairURL : '',
        last: function (data, coin_prices, toBTCURL) { //Where to find the last price of coin in JSON data
            return new Promise(function (res, rej) {
                let priceOfBTC = data.btc.last;
                console.log(priceOfBTC);
                try {
                    for (let key in data) {
                        let coinName = key.toUpperCase();
                        let price = data[key].last;
                        if (!coin_prices[coinName]) coin_prices[coinName] = {};

                        coin_prices[coinName]["jubi"] = data[key].last / priceOfBTC;
                    }
                    res(coin_prices);
                }

                catch (err) {
                    console.log(err);
                    rej(err)
                }
            })
        }

    },

    {
        marketName: 'bleutrade',
        URL: 'https://bleutrade.com/api/v2/public/getmarketsummaries', //URL To Fetch API From.
        toBTCURL: false, //URL, if needed for an external bitcoin price api.
        pairURL : '',
        last: function (data, coin_prices) { //Get the last price of coins in JSON data
            return new Promise(function (res, rej) {
                try {
                    for (let obj of data.result) {
                        if(obj["MarketName"].includes('_BTC')) {
                            let coinName = obj["MarketName"].replace("_BTC", '');
                            if (!coin_prices[coinName]) coin_prices[coinName] = {};
                            coin_prices[coinName].bleutrade = obj.Last;
                        }
                    }
                    res(coin_prices);

                }
                catch (err) {
                    console.log(err);
                    rej(err);
                }

            })
        },
    },
    */

    {   enabled:false,
        marketName: 'poloniex',
        URL: 'https://poloniex.com/public?command=returnTicker',
        toBTCURL: false,
        pairURL : '',
        last: function (data, coin_prices) { //Where to find the last price of coin in JSON data
            return new Promise(function (res, rej) {
                try {
                    for (var obj in data) {
                        if(obj.includes('BTC_')&&obj!=="BTC_EMC2") {
                            let coinName = obj.replace("BTC_", '');
                            if (!coin_prices[coinName]) coin_prices[coinName] = {};
                            coin_prices[coinName].poloniex = data[obj].last;
                        }
                    }
                    res(coin_prices);
                }
                catch (err) {
                    console.log(err);
                    rej(err);
                }

            })
        },

    },
    /*
    {
		marketName: 'cryptopia',
		URL: 'https://www.cryptopia.co.nz/api/GetMarkets/BTC', //URL To Fetch API From.
		toBTCURL: false, //URL, if needed for an external bitcoin price api.
        pairURL : '',
        last: function (data, coin_prices) { //Get the last price of coins in JSON data
			return new Promise(function (res, rej) {
				try {
					for (let obj of data.Data) {
						if(obj["Label"].includes('/BTC')) {
							let coinName = obj["Label"].replace("/BTC", '');
							if (!coin_prices[coinName]) coin_prices[coinName] = {};
							coin_prices[coinName].cryptopia = obj.LastPrice;
                        }
                    }
                    res(coin_prices);

                }
                catch (err) {
                    console.log(err);
                    rej(err);
                }

            })
		},
	},
	*/
	{
        enabled:false,
        marketName: 'kraken', // kraken has no one size fits all market summery so each pair has to be entered as param in GET - will need to add new coins as they are added to exchange
        URL: 'https://api.kraken.com/0/public/Ticker?pair=DASHXBT,EOSXBT,GNOXBT,ETCXBT,ETHXBT,ICNXBT,LTCXBT,MLNXBT,REPXBT,XDGXBT,XLMXBT,XMRXBT,XRPXBT,ZECXBT', //URL To Fetch API From.
        toBTCURL: false, //URL, if needed for an external bitcoin price api.
        pairURL : '',
        last: function (data, coin_prices) { //Get the last price of coins in JSON data
            return new Promise(function (res, rej) {
                try {
                    for (let key in data.result) {
                        let arr = key.match(/DASH|EOS|GNO|ETC|ETH|ICN|LTC|MLN|REP|XDG|XLM|XMR|XRP|ZEC/); // matching real names to weird kraken api coin pairs like "XETCXXBT" etc
                        let name = key;
                        let matchedName = arr[0];
                        if (matchedName === "XDG") { //kraken calls DOGE "XDG" for whatever reason
                            let matchedName = "DOGE";
                            var coinName = matchedName;
                        } else {
                            var coinName = matchedName;
                        }

                        if (!coin_prices[coinName]) coin_prices[coinName] = {};

                        coin_prices[coinName].kraken = data.result[name].c[0];

                    }
                    res(coin_prices);

                }
                catch (err) {
                    console.log(err);
                    rej(err);
                }

            })
        },
    },

];

let marketNames = [];
for(let i = 0; i < markets.length; i++) { // Loop except cryptowatch
    marketNames.push([[markets[i].marketName], [markets[i].pairURL]]);
}
console.log("Markets:", marketNames);
module.exports = function () {
    this.markets = markets;
    this.marketNames = marketNames;
};
