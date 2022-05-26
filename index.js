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

//Verify JWT Function
// function verifyJwt(req, res, next){
//     const authHeader = req.headers.authorization;
//     if(!authHeader){
//         return res.status(401).send({message: "unauthorized access"})
//     }

//     const token = authHeader.split(' ')[1];

//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err,decoded){
//         if(err){
//             return res.status(403).send({message:"Forbidden Access"})
//         }

//         req.decode = decoded;
//         next();
//     })

// }



async function run() {
  try {
    await client.connect();
    const toolCollection = client.db('ceramic-tiles').collection('tools');
    const orderCollection = client.db('ceramic-tiles').collection('order');
    const reviewCollection = client.db('ceramic-tiles').collection('review');

    //get all tools
    app.get('/tools', async (req, res) => {
      const tools = await toolCollection.find().toArray();
      res.send(tools);
    });

    //get a single tools

    app.get('/tools/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const tool = await toolCollection.findOne(query)
      res.send(tool)
    })

    //insert order
    app.post('/order', async (req, res) => {
      const orderObject = req.body;
      const order = await orderCollection.insertOne(orderObject);
      return res.send(order);
    });
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