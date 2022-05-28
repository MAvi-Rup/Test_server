const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qxw6j.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// Verify JWT Function

function verifyJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded = decoded;
    next();
  });
}



async function run() {
  try {
    await client.connect();
    const toolCollection = client.db('ceramic-tiles').collection('tools');
    const orderCollection = client.db('ceramic-tiles').collection('order');
    const reviewCollection = client.db('ceramic-tiles').collection('review');
    const userCollection = client.db('ceramic-tiles').collection('user');
    const confirmCollection = client.db('ceramic-tiles').collection('confirmOrder');


    //admin function
    const verifyAdmin = async (req, res, next) => {
      const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({ email: requester });
      if (requesterAccount.role === 'admin') {
        next();
      }
      else {
        res.status(403).send({ message: 'forbidden' });
      }
    }

    //get all tools
    app.get('/tools', async (req, res) => {
      const tools = await toolCollection.find().toArray();
      res.send(tools);
    });

    app.delete('/tools/:id',verifyJwt, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await toolCollection.deleteOne(query)
      res.send(result)
  })

    //post tools
    app.post('/tools', verifyJwt, verifyAdmin, async (req, res) => {
      const tools = req.body;
      const result = await toolCollection.insertOne(tools);
      res.send(result);
    });

    //get a single tools

    app.get('/tools/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const tool = await toolCollection.findOne(query)
      res.send(tool)
    })


    app.delete('/order/:id',verifyJwt, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query)
      res.send(result)
  })





    //insert order
    app.post('/order', async (req, res) => {
      const orderObject = req.body;
      const order = await orderCollection.insertOne(orderObject);
      return res.send(order);
    });

    app.post('/confirm', async (req, res) => {
      const orderObject = req.body;
      const order = await confirmCollection.insertOne(orderObject);
      return res.send(order);
    });

    app.get('/order', verifyJwt, async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const orders = await orderCollection.find(query).toArray();
      return res.send(orders);

    })
    //insert review
    app.post('/review', async (req, res) => {
      const reviewObject = req.body;
      const review = await reviewCollection.insertOne(reviewObject);
      return res.send(review);
    });
    //get all review
    app.get('/review', async (req, res) => {
      const review = await reviewCollection.find().toArray();
      res.send(review);
    });
    //put user
    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({ result, token });
    });
    //get user
    app.get('/user', async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    //update user
    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const updatedUser = req.body;
      const filter = { email: email }
      const options = { upsert: true }
      const updateUser = {
        $set: {
          disPlayName: updatedUser.name,
          address: updatedUser.address,
          number: updatedUser.number
        }
      }
      const result = await userCollection.updateOne(filter,updateUser,options)
      res.send(result)
    })



    //admin
    app.put('/user/admin/:email', verifyJwt, verifyAdmin, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: { role: 'admin' },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    //admin check

    app.get('/admin/:email', async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.role === 'admin';
      res.send({ admin: isAdmin })
    })




  }
  finally {

  }
}

run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello From Ceramic Tiles')
})

app.listen(port, () => {
  console.log(`Ceramic Tiles listening on port ${port}`)
})