const Sequelize = require('sequelize');
var kafka = require('kafka-node');
var db = require('./../models');
var kafka = require('kafka-node');
const { io } = require('./../server');
const Op = Sequelize.Op;
const bigNumber = require('bignumber.js');

const tradingSocket = io.of('/trading');

var kafka = require('kafka-node');
Consumer = kafka.Consumer,
client = new kafka.Client(),
consumer = new Consumer(client,
    [{ topic: 'btc.eth.orderexecuted'}],
    {
        autoCommit: true
    }
);
consumer.on('message', function (message) {
    var data = JSON.parse(message.value);
    console.log("message><><><><><><>", message);
    if (message.topic == "btc.eth.orderexecuted") {
        console.log("order Executed at price ", data.price);
        console.log("maker order id", data.maker);
        console.log("taker order id", data.taker);
        console.log("quntity is ", data.quantity);
        (async () => {
            try {
                var maker = await db.orders.findOne({
                    where: {
                        id: data.maker
                    }, raw: true
                });
                var taker = await db.orders.findOne({
                    where: {
                        id: data.taker
                    }, raw: true
                });
                console.log('maker -> ', maker);
                console.log('taker -> ', taker);

                const tp = await db.tradingpairs.findOne({
                    where: {
                        id: 1
                    }
                });
                console.log("maker ki side ", maker.side);
                if (maker.side == "buy") {
                    console.log("handeling buy" ,maker,taker,tp,data);
                    await handleBuy(maker, taker, tp, data)
                }
                else if (maker.side == "sell") {
                    console.log("handeling sell" ,maker,taker,tp,data);
                    await handleSell(maker, taker, tp, data)
                }


                maker = await db.orders.findOne({
                    where: {
                        id: data.maker
                    }, raw: true
                });
                taker = await db.orders.findOne({
                    where: {
                        id: data.taker
                    }, raw: true
                });
                var makerQuantity = new bigNumber(maker.quantity);
                var makerFilled = new bigNumber(maker.filled);
                var takerQuantity = new bigNumber(taker.quantity);
                var takerFilled = new bigNumber(taker.filled);


                console.log("maker quant->", makerQuantity)
                console.log("maker filled->", makerFilled)
                console.log("taker quant->", takerQuantity)
                console.log("taker fill->", takerFilled)

                var makerTosock = {
                    id: maker.id,
                    quantity: maker.quantity,
                    side:maker.side

                }
                var takerToSock = {
                    id: taker.id,
                    quantity: taker.quantity,
                    side:taker.side
                }
            
                tradingSocket.emit('orderFilled', makerTosock)
                tradingSocket.emit('orderFilled', takerToSock)
                if (makerQuantity.isEqualTo(makerFilled)) {

                    await db.orders.update({
                        status: "complete"
                    }, {
                            where: {
                                id: maker.id
                            }
                        })
                        console.log("emitting order complete")
                    tradingSocket.emit('orderComplete', maker.id)
                }
                
                if (takerQuantity.isEqualTo(takerFilled)) {
                    await db.orders.update({
                        status: "complete"
                    }, {
                            where: {
                                id: taker.id
                            }
                        })
                        console.log("emitting order complete")
                    tradingSocket.emit('orderComplete', taker.id)
                }
           
            } catch (err) {
                console.log(err);
            }
        })();
    }
    else if (message.topic == 'btc.eth.ordercancelled') {
        console.log("order cancel event emitting", message.value)

        tradingSocket.emit("orderCancelled", JSON.parse(message.value));
    }
});


var Producer = kafka.Producer,
    client = new kafka.Client(),
    producer = new Producer(client);
producer.on('ready', function () {
    console.log('Producer is ready');
});
producer.on('error', function (err) {
    console.log('Producer is in error state');
    console.log(err);
})

const handleBuy = async function (maker, taker, tp, data) {

    console.log("buy side");
    console.log(data);
    return db.sequelize.transaction(function (t) {
        return db.Wallets.update({
            locked: Sequelize.literal(`locked - ${data.quantity * data.price}`)
        }, {
                where: {
                    traderId: maker.traderId,
                    supportedTokenId: tp.mainTokenId
                }
            }, { transaction: t }).then(function () {
                return db.Wallets.update({
                    balance: Sequelize.literal(`balance + ${data.quantity * data.price}`)
                }, {
                        where: {
                            traderId: taker.traderId,
                            supportedTokenId: tp.mainTokenId
                        }
                    }, { transaction: t }).then(function () {
                        return db.Wallets.update({
                            balance: Sequelize.literal(`balance + ${data.quantity}`)
                        }, {
                                where: {
                                    traderId: maker.traderId,
                                    supportedTokenId: tp.secondaryTokenId
                                }
                            }, { transaction: t }).then(function () {
                                return db.Wallets.update({
                                    locked: Sequelize.literal(`locked - ${data.quantity}`)
                                }, {
                                        where: {
                                            traderId: taker.traderId,
                                            supportedTokenId: tp.secondaryTokenId
                                        }
                                    }, { transaction: t }).then(function () {

                                        return db.orders.update({
                                            filled: data.quantity,
                                            status: "partial fill"
                                        }, {
                                                where: {
                                                    id: maker.id
                                                }
                                            }, { transaction: t }).then(function () {
                                                return db.orders.update({
                                                    filled: Sequelize.literal(`filled + ${data.quantity}`),
                                                    status: "partial fill"
                                                }, {
                                                        where: {
                                                            id: taker.id
                                                        }
                                                    }, { transaction: t });


                                            });

                                    });
                            });
                    });
            });

    }).then(function (result) {

        // Transaction has been committed
        // result is whatever the result of the promise chain returned to the transaction callback
    }).catch(function (err) {
        console.log(err);
        // Transaction has been rolled back
        // err is whatever rejected the promise chain returned to the transaction callback
    });

}
const handleSell = async function (maker, taker, tp, data) {
    console.log("sellside");
    console.log(data.quantity);
    return db.sequelize.transaction(function (t) {

        // chain all your queries here. make sure you return them.
        return db.Wallets.update({
            locked: Sequelize.literal(`locked - ${data.quantity * data.price}`)
        }, {
                where: {
                    traderId: taker.traderId,
                    supportedTokenId: tp.mainTokenId
                }
            }, { transaction: t }).then(function () {
                return db.Wallets.update({
                    balance: Sequelize.literal(`balance + ${data.quantity * data.price}`)
                }, {
                        where: {
                            traderId: maker.traderId,
                            supportedTokenId: tp.mainTokenId
                        }
                    }, { transaction: t }).then(function () {
                        return db.Wallets.update({
                            balance: Sequelize.literal(`balance + ${data.quantity}`)
                        }, {
                                where: {
                                    traderId: taker.traderId,
                                    supportedTokenId: tp.secondaryTokenId
                                }
                            }, { transaction: t }).then(function () {
                                return db.Wallets.update({
                                    locked: Sequelize.literal(`locked - ${data.quantity}`)
                                }, {
                                        where: {
                                            traderId: maker.traderId,
                                            supportedTokenId: tp.secondaryTokenId
                                        }
                                    }, { transaction: t }).then(function () {

                                        return db.orders.update({
                                            filled: data.quantity,
                                            status: "partial fill"
                                        }, {
                                                where: {
                                                    id: maker.id
                                                }
                                            }, { transaction: t }).then(function () {
                                                return db.orders.update({
                                                    filled: Sequelize.literal(`filled + ${data.quantity}`),
                                                    status: "partial fill"
                                                }, {
                                                        where: {
                                                            id: taker.id
                                                        }
                                                    }, { transaction: t });
                                            });
                                    });
                            });
                    });
            });
    }).then(function (result) {


    }).catch(function (err) {
        console.log(err);
        // Transaction has been rolled back
        // err is whatever rejected the promise chain returned to the transaction callback
    });
}
const orderNotification = function (data) {
    console.log("order submit event emitting", data)
    tradingSocket.emit("newOrder", data);
}
module.exports = {
    orderNotification: orderNotification,
    async sendToengine(data) {
        var meta = {
            "orderId": data.id,
            "orderType": data.type,
            "orderSide": data.side,
            "quantity": data.quantity,
            "price": data.price
        }
        var payloads = [
            { topic: "btc.eth.neworder", messages: [JSON.stringify(meta)], partition: 0 }
        ];
        producer.send(payloads, function (err, data) {
            console.log(`err ${err}`);
            console.log(`data ${data}`);
        });
    },
    async cancelToEngine(data) {
        console.log("sending cacellation request");
        var payloads = [
            { topic: "btc.eth.cancelorder", messages: [JSON.stringify(data)], partition: 0 }
        ];

        producer.send(payloads, function (err, data) {
            console.log(`err ${err}`);
            console.log(`data ${data}`);
        });
    },
    async submitOrder(ctx) {
        try {
            const mainCoin = await ctx.db.supportedTokens.findOne({ where: { symbol: ctx.request.body.main } });
            const secondary = await ctx.db.supportedTokens.findOne({ where: { symbol: ctx.request.body.secondary } });
            if (mainCoin && secondary) {
                const tradingPair = await ctx.db.tradingpairs.findOne({ where: { mainTokenId: mainCoin.id, secondaryTokenId: secondary.id } });

                if (tradingPair) {
                
                    console.log("request", ctx.request.body);
                    console.log(ctx.request.body);
                    if (ctx.request.body.side == "buy") {
                        const wallet = await ctx.db.Wallets.findOne({
                            where: {
                                traderId: ctx.state.trader,
                                supportedTokenId: mainCoin.id
                            }
                        });
                        console.log("wallet",wallet);
                        if(wallet ==null){
                            ctx.body=  {
                                buy: {
                                    status: 0,
                                    message: "Intialize your wallets",
                                    order
                                }

                            }
                        }

                        if (wallet) {
                            console.log("wallet", wallet);

                            if (wallet.balance >= ctx.request.body.quantity * ctx.request.body.price) {


                                return ctx.db.sequelize.transaction(function (t) {
                                    // chain all your queries here. make sure you return them.

                                    return ctx.db.Wallets.update({
                                        balance: Sequelize.literal(`balance - ${ctx.request.body.quantity * ctx.request.body.price}`),
                                        locked: Sequelize.literal(`locked + ${ctx.request.body.quantity * ctx.request.body.price}`),
                                    }, {
                                            where: {
                                                traderId: ctx.state.trader,
                                                supportedTokenId: mainCoin.id
                                            }
                                        }, { transaction: t }).then(function () {
                                            return ctx.db.orders.create({
                                                quantity: ctx.request.body.quantity,
                                                filled: 0,
                                                traderId: ctx.state.trader,
                                                price: ctx.request.body.price,
                                                side: 'buy',
                                                type: ctx.request.body.type,
                                                status: 'Active',
                                                tradingpairId: tradingPair.id
                                            }, { transaction: t })
                                        });

                                }).then(function (order) {

                                    module.exports.sendToengine(order);
                                    module.exports.orderNotification(order);
                                    var response = {
                                        buy: {
                                            status: 1,
                                            message: "Buy request sent",
                                            order
                                        }

                                    }
                                    ctx.body = response;
                                    // Transaction has been committed
                                    // result is whatever the result of the promise chain returned to the transaction callback
                                }).catch(function (err) {

                                    console.log(err);
                                    ctx.body = err;
                                    // Transaction has been rolled back
                                    // err is whatever rejected the promise chain returned to the transaction callback
                                });
                            } else {
                                ctx.body = {
                                    order: {
                                        status: 0,
                                        message: "Not enough balance"
                                    }
                                }
                            }
                        }
                    }
                    else if (ctx.request.body.side == "sell") {
                        const wallet = await ctx.db.Wallets.findOne({
                            where: {
                                traderId: ctx.state.trader,
                                supportedTokenId: secondary.id
                            }
                        });
                        console.log(wallet);
                        if (wallet) {
                            if (wallet.balance >= ctx.request.body.quantity) {
                                return ctx.db.sequelize.transaction(function (t) {
                                    // chain all your queries here. make sure you return them.

                                    return ctx.db.Wallets.update({
                                        balance: Sequelize.literal(`balance - ${ctx.request.body.quantity}`),
                                        locked: Sequelize.literal(`locked + ${ctx.request.body.quantity}`),
                                    }, {
                                            where: {
                                                traderId: ctx.state.trader,
                                                supportedTokenId: secondary.id
                                            }
                                        }, { transaction: t }).then(function (Wallets) {
                                            return ctx.db.orders.create({
                                                quantity: ctx.request.body.quantity,
                                                filled: 0,
                                                traderId: ctx.state.trader,
                                                price: ctx.request.body.price,
                                                side: 'sell',
                                                type: ctx.request.body.type,
                                                status: 'Active',
                                                tradingpairId: tradingPair.id
                                            }, { transaction: t });
                                        });

                                }).then(function (order) {

                                    module.exports.sendToengine(order);
                                    module.exports.orderNotification(order);
                                    ctx.body = {
                                        sell: {
                                            status: 1,
                                            message: "Sell request sent",
                                            order
                                        }
                                    }
                                    // Transaction has been committed
                                    // result is whatever the result of the promise chain returned to the transaction callback
                                }).catch(function (err) {

                                    console.log(err);
                                    ctx.body = err;
                                    // Transaction has been rolled back
                                    // err is whatever rejected the promise chain returned to the transaction callback
                                });




                            } else {
                                ctx.body = {
                                    order: {
                                        status: 0,
                                        message: "Not enough balance"
                                    }
                                }
                            }
                        }
                    }
                } else {
                    ctx.body = {
                        tradindpair: {
                            status: 0,
                            message: "Trading pair is not valid."
                        }
                    }
                }


            } else {
                ctx.body = {
                    order: {
                        status: 0,
                        message: "Invalid arguments"
                    }
                }
            }


        } catch (err) {

        }

    },
    async completedOrders(ctx) {
        try {
            ctx.body = await ctx.db.orders.findAll({
                where: {
                    status: 'complete'
                },
                attributes: ['price', 'createdAt']
            });
        } catch (err) {

        }
    },
    async cancelOrder(ctx) {


        try {

            const order = await ctx.db.orders.update({ status: "cancelled" }
                , {
                    where: {
                        id: ctx.request.body.orderId
                    }
                });
            console.log("update", order[0]);
            if (order[0] == 1) {
                var meta = {
                    "orderId": ctx.request.body.orderId,
                    "side": ctx.request.body.side
                };
                module.exports.cancelToEngine(meta);
            }
            ctx.body = {
                orderCancel: {
                    status: 1,
                    message: "order cancelled"
                }
            }


        } catch (err) {

        }

    },
    async activeMarketOrders(ctx) {
        try {
            ctx.body = await ctx.db.orders.findAll({
                where: {
                    status: {
                        [Op.ne]: 'cancelled'
                    }
                }
            })
        } catch (err) {
            console.log(err);
        }
    }
    ,
    async orderHistory(ctx) {
        try {
            ctx.body = await ctx.db.orders.findAll();
        } catch (err) {
            console.log(err);
        }
    },
    async activeOrders(ctx) {
        ctx.body = await ctx.db.orders.findAll({
            where: {
                traderId: ctx.state.trader,
                status: {
                    [Op.notLike]: "cancelled"
                }
            }
        });
    }
    , async tradingPair(ctx) {
        try {
            const mainCoin = await ctx.db.supportedTokens.findOne({ where: { symbol: ctx.params.main } });
            const secondary = await ctx.db.supportedTokens.findOne({ where: { symbol: ctx.params.secondary } });
            if (mainCoin && secondary) {
                const tradindPair = await ctx.db.tradingpairs.findOne({ where: { mainTokenId: mainCoin.id, secondaryTokenId: secondary.id } })
                console.log("tp", tradindPair);
                if (tradindPair) {
                    ctx.body = {
                        tradingpair: {
                            status: 1,
                            message: "Trading pair available , send requests for order book and other acitivities"
                        }
                    }
                } else {
                    ctx.body = {
                        tradingpair: {
                            status: 0,
                            message: "Trading pair is not valid."
                        }
                    }
                }
            } else {
                ctx.body = {
                    tradingpair: {
                        status: 0,
                        message: "Trading pair is not valid."
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    }
}