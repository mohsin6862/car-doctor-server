const express = require('express');
const cors = require('cors');
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json())

console.log(process.env.USER_PASS)


const uri = `mongodb+srv://${process.env.USER_ID}:${process.env.USER_PASS}@mohsin.hrlaneq.mongodb.net/?retryWrites=true&w=majority`;

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

    const servicesCollection = client.db("carDoctorDB").collection("servicesDB")
    const bookingCollection = client.db("carDoctorDB").collection("bookingDB")

    // jwt access token

    app.post('/jwt',(req,res)=>{
        const user = req.body;
        console.log(user);
        const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
            expiresIn: '1hr'
        });
        res.send({token})
    })

    app.get('/services',async(req,res)=>{
      const sort = req.query.sort
      const query = {};
      const options = {
   
        sort: { "price": sort=== 'acc'? -1: 1},
  
      };
        const cursor = servicesCollection.find(query,options)
        const result =await cursor.toArray()
        res.send(result)
    })
    app.get('/services/:id',async(req,res)=>{
         const id = req.params.id;
         const query = { _id: new ObjectId(id)};
         const options = {
            // Include only the `title` and `imdb` fields in the returned document
            projection: {  title: 1, price: 1 ,img:1},
          };
         const result = await servicesCollection.findOne(query,options)
         res.send(result)

    })

    app.get('/bookings',async(req,res)=>{
        let query = {}
        if(req.query?.email){
            query ={email: req.query.email}
        }
        const result = await bookingCollection.find(query).toArray()
        res.send(result)
    })

    app.post('/bookings',async(req,res)=>{
        const booking = req.body
        const result = await bookingCollection.insertOne(booking);
        res.send(result)
    });

    app.patch('/bookings/:id',async(req,res)=>{
        const id = req.params.id;
        const filter  = {_id : new ObjectId(id)}
        const updateBooking = req.body;
        console.log(updateBooking)
        const updateDoc = {
            $set: {
              status:'confirm'
            },
          };
          const result = await bookingCollection.updateOne(filter,updateDoc);
          res.send(result)
    })

    app.delete('/bookings/:id',async(req,res)=>{
        const id = req.params.id;
        const query ={_id: new ObjectId(id)};
        const result = await bookingCollection.deleteOne(query)
        res.send(result)
    })

    const carDoctorDB =
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req,res)=>{
    res.send('Car Doctor server is running')
})

app.listen(port,()=>{
    console.log(`car-doctor server is running on port ${port}`)
})
