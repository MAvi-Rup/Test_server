const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 9000;

app.use(cors());
// app.use(express.json());

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });





let client = MongoClient.connect(
'mongodb://myDB:admin123@my-cluster.cluster-cc9elxrxbw5x.us-east-1.docdb.amazonaws.com:27017/sample-database?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false',
{
  tlsCAFile: `rds-combined-ca-bundle.pem` //Specify the DocDB; cert
},

function(err, client) {
    if(err)
        throw err;
        
//     app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });
const specialProductCollection = client.db('pharma_db').collection('special_products');
const allProductCollection = client.db('pharma_db').collection('all_products');

//get all Products
app.get('/specialProducts', async (req, res) => {
  const tools = await specialProductCollection.find().toArray();
  res.send(tools);
});


app.get('/specialProducts/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) }
  const tool = await specialProductCollection.findOne(query)
  res.send(tool)
})


//get all products
app.get('/allProducts', async (req, res) => {
  const tools = await allProductCollection.find().toArray();
  res.send(tools);
});

app.get('/allProducts/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) }
  const tool = await allProductCollection.findOne(query)
  res.send(tool)
})

});







// async function run() {
//   try {
//     await client.connect();
    




//   }
//   finally {

//   }
// }

// run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello From Pharma DB')
})

app.listen(port, () => {
  console.log(`Pharma DB listening on port ${port}`)
})