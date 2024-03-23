require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors');

app.use(cors());
app.use(express.json())
app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

//connect to db
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('Connected to DB, Server running at port ', process.env.PORT)
        })
    })
    .catch((error) => {
        console.log(error)
    })

//db = demo, collection = data

//define schema
const personSchema = new mongoose.Schema({
    date: String,
    gender: String,
    age: Number,
    timeWatched: Number
}, {
    collection: 'data'
})
const Person = mongoose.model('Person', personSchema)

// test insert of data
// const person = new Person({
//     date: '2023-01-01 16:00:00',
//     gender: 'Male',
//     age: '22',
//     timeWatched: '23'
// })
// person.save()

//define routes
app.get('/api/persons', async (req,res)=> {
    try {
        //fetch all persons from mongo
        const persons = await Person.find()
        res.json(persons)
    } catch(e) { 
        console.error('Error fetching persons: ', e)
    }
})
