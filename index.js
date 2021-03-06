const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const fileUpload = require("express-fileupload")

const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())
app.use(fileUpload())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aobjx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("black-belt");
        const blogsCollection = database.collection("blogs");
        const usersCollection = database.collection("users");

        app.post("/blog", async (req, res) => {
            const name = req.body.name;
            const title = req.body.title;
            const catagory = req.body.catagory;
            const description = req.body.description;
            const time = req.body.time;
            const date = req.body.date;
            const cost = req.body.cost;
            const location = req.body.location;
            const rating = req.body.rating;
            const status = req.body.status;

            const pic = req.files.image;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodedPic, 'base64');
            const blogs = {
                name,
                title,
                catagory,
                description,
                time,
                date,
                cost,
                location,
                rating,
                status,
                image: imageBuffer
            }
            const result = await blogsCollection.insertOne(blogs);
            res.json(result);
        })

        app.get("/blog", async (req, res) => {
            const result = await blogsCollection.find({}).toArray()
            console.log(result);
            res.json(result)
        })

        app.get("/singleBlog/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await blogsCollection.findOne(query)
            res.json(result)
        })

        app.get("/allBlogs", async (req, res) => {
            const result = await blogsCollection.find({}).toArray()
            res.json(result)
        })

        app.delete("/deleteSingleBlog/:blogId", async (req, res) => {
            const id = req.params.blogId;
            const query = { _id: ObjectId(id) };
            const result = await blogsCollection.deleteOne(query)
            res.json(result)
        })

        app.put("/handleStatus/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: `Approved`
                },
            };
            const result = await blogsCollection.updateOne(filter, updateDoc, options);
            res.json(result)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        app.put("/user/admin", async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const options = { upsert: true };
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            let isAdmin = false;
            if (user?.role === "admin") {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})