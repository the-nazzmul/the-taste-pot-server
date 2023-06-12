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

const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_KEY_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: true, message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next()
    })
}


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const classCollection = client.db('tastePot').collection('classes')

        // JWT
        app.post('/jwt', async (req, res) => {
            const userEmail = req.body;
            const token = jwt.sign(userEmail, process.env.ACCESS_KEY_TOKEN, { expiresIn: '1d' })
            res.send({ token })
        })

        // verify admin
        const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            if (user?.role !== 'admin') {
                return res.status(403).send({ error: true, message: 'forbidden access' })
            }
            next()
        }
        // verify instructor
        const verifyInstructor = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            if (user?.role !== 'instructor') {
                return res.status(403).send({ error: true, message: 'forbidden access' })
            }
            next()
        }

        // user related apis

        app.get('/users', verifyJWT, verifyAdmin, async (req, res) => {

            const result = await userCollection.find().toArray()
            res.send(result)
        })

        app.get('/users/role/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            if (req.decoded.email !== email) {
                return res.send({ admin: false })
            }
            const query = { email: email };
            const user = await userCollection.findOne(query);
            const result = { admin: user?.role }
            return res.send(result)
        })

        app.get('/users/instructors', async (req, res) => {
            const query = { role: 'instructor' }
            const result = await userCollection.find(query).toArray()
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

        app.patch('/users/:role', verifyJWT, verifyAdmin, async (req, res) => {
            const userEmail = req.body.email;
            const query = { email: userEmail }
            const roleUpdate = req.params.role

            if (roleUpdate === 'instructor') {
                const update = {
                    $set: {
                        role: roleUpdate
                    }
                }
                const result = await userCollection.updateOne(query, update)
                res.send(result)
            }
            else {
                const update = {
                    $set: {
                        role: roleUpdate
                    }
                }
                const result = await userCollection.updateOne(query, update)
                res.send(result)
            }
        })




        // Class related apis

        app.get('/classes', async(req,res)=> {
            const query = {status: 'approved'}
            const result = await classCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/allClasses',verifyJWT,verifyAdmin, async(req, res)=> {
            const result = await classCollection.find().toArray()
            res.send(result)
        })

        app.post('/classes', verifyJWT, verifyInstructor, async (req, res) => {
            const newClass = req.body
            const result = await classCollection.insertOne(newClass)
            res.send(result)
        })

        app.patch('/allClasses', verifyJWT, verifyAdmin, async(req, res) =>{
            const classId = req.body.id;
            const approval = req.body.approval;
            const query = {_id: new ObjectId(classId)}
            const update = {
                $set: {
                    status: approval
                }
            }
            const result = classCollection.updateOne(query, update)
            res.send(result)

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