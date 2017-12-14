/**
 * Created by Manu Masson on 6/27/2017.
 *
 */

'use strict';

console.log('Starting app...');

const request = require('request'), Promise = require("bluebird"); //request for pulling JSON from api. Bluebird for Promises.

const express = require('express'),
    app = express(),
    helmet = require('helmet'),
    http = require('http').Server(app),
    io = require('socket.io')(http); // For websocket server functionality

app.use(helmet.hidePoweredBy({setTo: 'PHP/5.4.0'}));

const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/docs'));

http.listen(port, function () {
    console.log('listening on', port);
});


require('./settings.js')(); //Includes settings file.
// let db = require('./db.js'); //Includes db.js


let coinNames = [];
io.on('connection', function (socket) {
    socket.emit('coinsAndMarkets', [marketNames, coinNames]);
    socket.emit('results', results);
});

// coin_prices is an object with data on price differences between markets. = {BTC : {market1 : 2000, market2: 4000, p : 2}, } (P for percentage difference)
// results is a 2D array with coin name and percentage difference, sorted from low to high.
let coin_prices = {}, numberOfRequests = 0, results = []; // GLOBAL variables to get pushed to browser.

function getMarketData(options, coin_prices, callback) {   //GET JSON DATA
    return new Promise(function (resolve, reject) {
        request(options.URL, function (error, response, body) {
            try {
                let data = JSON.parse(body);
                console.log("Success", options.marketName);
                if (options.marketName) {

                    let newCoinPrices = options.last(data, coin_prices, options.toBTCURL);
                    numberOfRequests++;
                    if (numberOfRequests >= 1) computePrices(coin_prices);
                    resolve(newCoinPrices);

                }
                else {
                    resolve(data);
                }

            } catch (error) {
                console.log("Error getting JSON response from", options.URL, error); //Throws error
                reject(error);
            }

        });


    });
}


function getBest (data) {

    let Arbitrage = {
      bestCoin:{},
      topCoins:[]
    };

    let topN = 4; // Prime migliori 4 coins -> la prima "bestCoin" + 3 topCoins
    let highestN = 1;
    let initN = 1;
    let dataLen = data.length;

    for (let i = dataLen - initN; i >= dataLen - topN; i--) { //Loop through top 10

        let market1 = data[i].market1.name, market2 = data[i].market2.name, pairIndex, coinName = data[i].coin;

        for (let j = data.length - 1; j >= 0; j--) {
            if (
                data[j].market1.name === market2 //equal ...
                && data[j].market2.name === market1 // to opposite market
                && data[i].coin !== data[j].coin //and isnt the same coin as pair
                && data[j].coin !== 'BTC' //and isnt BTC
              ) // and isnt disabled
            {
                pairIndex = j;
                break;
            }
        }

        if (pairIndex > -1) { //TODO  FIX pairs, not showing up correctly
            let context = { //All required data
                coin: data[i].coin,
                diff: ((data[i].spread - 1) * 100).toFixed(3),
                market2price: (data[i].market2.last * 1000).toPrecision(3),
                market2: market2,
                market1price: (data[i].market1.last * 1000).toPrecision(3),
                market1: market1,
                pair: {
                    coin: data[pairIndex].coin,
                    diff: ((data[pairIndex].spread - 1) * 100).toFixed(3),
                    market2price: (data[pairIndex].market2.last * 1000).toPrecision(3),
                    market2: data[pairIndex].market2.name,
                    market1price: (data[pairIndex].market1.last * 1000).toPrecision(3),
                    market1: data[pairIndex].market1.name,
                },
                totalDiff: (((data[i].spread - 1) * 100) + ((data[pairIndex].spread - 1) * 100)).toFixed(2)
            };

            if (i === data.length - highestN) { //Add only the highest
              Arbitrage.bestCoin = context;
            }else{
              Arbitrage.topCoins.push(context);
            }

        }else if (data.length - topN > 0) {
            topN++;
            highestN++;
        }
    }

    return Arbitrage;
};

async function computePrices(data) {
    results = [];

    function loopData() {
        return new Promise(function (resolve, reject) {

            if (numberOfRequests >= 2) {

                for (let coin in data) {

                    if (Object.keys(data[coin]).length > 1) {
                        if (coinNames.includes(coin) == false) coinNames.push(coin);
                        let arr = [];
                        for (let market in data[coin]) {
                            arr.push([data[coin][market], market]);
                        }
                        arr.sort(function (a, b) {
                            return a[0] - b[0];
                        });
                        for (let i = 0; i < arr.length; i++) {
                            for (let j = i + 1; j < arr.length; j++) {
                                results.push(
                                    {
                                        coin: coin,
                                        spread: arr[i][0] / arr[j][0],
                                        market2: {
                                            name: arr[i][1],
                                            last: arr[i][0]
                                        },
                                        market1: {
                                            name: arr[j][1],
                                            last: arr[j][0]
                                        }

                                    },
                                    {//TODO, shouldnt have to create duplicate object for same markets
                                        coin: coin,
                                        spread: arr[j][0] / arr[i][0],
                                        market2: {
                                            name: arr[j][1],
                                            last: arr[j][0]
                                        },
                                        market1: {
                                            name: arr[i][1],
                                            last: arr[i][0]
                                        }

                                    }
                                );

                                // db.insert({
                                //     coin: coin,
                                //     lastSpread: arr[i][0] / arr[j][0],
                                //     market1: {
                                //         name: arr[i][1],
                                //         last: arr[i][0]
                                //     },
                                //     market2: {
                                //         name: arr[j][1],
                                //         last: arr[j][0]
                                //     }
                                // })

                            }
                        }

                    }
                }
                results.sort(function (a, b) {
                    return a.spread - b.spread;
                });
                console.log('Finishing function...');
                resolve();
            }
        })
    }

    await loopData();

    console.log("Emitting Results...");

    console.log(getBest(results)); //  JSON with best Coins " Graziano "

    io.emit('results', results);
}


(async function main() {
    let arrayOfRequests = [];

    for (let i = 0; i < markets.length; i++) {
        if(markets[i].enabled){
          arrayOfRequests.push(getMarketData(markets[i], coin_prices));
        }
    }
    console.log("request"+arrayOfRequests.length);
    await Promise.all(arrayOfRequests.map(p => p.catch(e => e)))

        .then(results => computePrices(coin_prices))

        .catch(e => console.log(e));

    setTimeout(main, 10000);
})();
