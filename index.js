const express = require('express');
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)
const app = express();
const port = process.env.PORT || 4000;

// middlewarwe

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wy9csda.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const userCollection = client.db('tastePot').collection('users')

        // user related apis
        app.get('/users', async (req, res) => {

            const result = await userCollection.find().toArray()
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query)

            if (existingUser) {
                return res.send({ message: 'User already exists' })
            }
            const result = await userCollection.insertOne(user)
            res.send(result)
        })

        app.patch('/users/:role', async (req, res) => {
            const userEmail = req.body.email;
            const query = { email: userEmail }
            const roleUpdate = req.params.role
            if(roleUpdate === 'instructor'){
                const update = {
                    $set: {
                        role: roleUpdate
                    }
                }
                const result = await userCollection.updateOne(query, update)
                res.send(result)
            }
            else{
                const update = {
                    $set: {
                        role: roleUpdate
                    }
                }
                const result = await userCollection.updateOne(query, update)
                res.send(result)
            }
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('Pot is boiling')
})

app.listen(port, () => {
    console.log('Pot is boiling on port:', port);
})