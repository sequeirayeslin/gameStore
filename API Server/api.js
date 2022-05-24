const express = require('express');
const app = express();
const port = 3000;
const uri = require('./mongoUri.js');

const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(uri);
client.connect(
    
)

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


async function getData(query, collectionName){

    // await client.connect();

    var collection = client.db("Game").collection(collectionName);

    var result = await collection.findOne(query);

    // await client.close();
    return result;

}

async function addToCart(username, gameId){

    // await client.connect();

    var collection = client.db("Game").collection("UserCarts");


    var query = {
        "username": username
    }

    var cart = await collection.findOne(query);
    
    cart = cart.cartItems;
    cart.push(gameId);

    await collection.updateOne(query, {$set: {cartItems: cart}});

}

async function removeFromCart(username, gameId){
    
    var collection = client.db("Game").collection("UserCarts");
    var query = {
        "username": username
    }
    var cart = await collection.findOne(query);
    cart = cart.cartItems;
    var index = cart.indexOf(gameId);
    cart.splice(index, 1);
    await collection.updateOne(query, {$set: {cartItems: cart}});
    
}

async function clearCart(username){

    var collection = client.db("Game").collection("UserCarts");
    var query = {
        "username": username
    }
    await collection.updateOne(query, {$set: {cartItems: []}});

}

app.get('/', (req, res) => res.send('Hi!'));

app.get('/api/getGameInfo/:gameId', async function (req, res) {

    const gameId = req.params.gameId;

    const gameData = await getData({'gameId': gameId}, 'GameInfo');

    res.send(gameData.data);

});

app.get('/api/getCart/:username', async function (req, res) {

    const username = req.params.username;

    const data = await getData({'username': username}, 'UserCarts');
    const cart = data['cartItems'];

    res.send(cart);

});

app.get('/api/getLatestGames', async function (req, res){
    
        const data = await getData({'type':'latest_games'}, 'Recommendations');
        const gamesList = data['data'];
        res.send(gamesList);
    
});

app.get('/api/getRecommendedGames/:username', async function (req, res){
    const data = await getData({'type':'personalised_recommendations'}, 'Recommendations');
    const recommendations = data['data'][req.params.username];
    res.send(recommendations);
});

app.get('/api/admin/stopMongo/6111', async function (req, res) {
    await client.close();
    res.send('Mongo stopped');
});

app.get('/api/admin/startMongo/6111', async function (req, res) {
    await client.connect();
    res.send('Mongo started');
});

app.post('/api/addToCart/:username/:gameId', async function (req, res) {
    
    const username = req.params.username;
    const gameId = req.params.gameId;
  
    await addToCart(username, gameId);
    
    res.send();
});

app.post('/api/removeFromCart/:username/:gameId', async function (req, res) {
        
        const username = req.params.username;
        const gameId = req.params.gameId;
        await removeFromCart(username, gameId);
        res.send();
});

app.post('/api/clearCart/:username', async function (req, res) {
    
    const username = req.params.username;
  
    await clearCart(username);
    
    res.send();
});

app.listen(port, () => console.log(`Listening on port ${port}!`));