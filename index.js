require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const app = express()
const Person = require('./models/person')

app.use(express.static('build'))
app.use(express.json())

app.use(cors())

app.use(morgan('tiny'))
// Custom Morgan tokens
morgan.token('custom-name', (req) => req.body.name || 'no-name');
morgan.token('custom-number', (req) => req.body.number || 'no-number');
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms {"name":":custom-name","number":":custom-number"}')
);


let persons = [
    {
        id: "1",
        name: "Arto Hellas", 
        number: "040-12345"
      }
            
]


app.get('/info', (request, response) => {
    const currentTime = new Date()
    Person.find({}).then(persons => {
      const number = persons.length
  
    response.send(`
  <p>Phonebook has info for ${number} people</p>
  <p>${currentTime}</p>
  `)
  })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
   })
  })
  
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
  .then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
    })
    .catch(error => next(error))
  })

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;
  if (!name || !number) {
    return response.status(400).json({ 
      error: 'name or number is missing' 
    })
  }
  
   Person.findByIdAndUpdate(
    request.params.id,
    { number }, // Fields to update
    { new: true, runValidators: true, context: 'query' } // Options
  )
    .then(updatedPerson  => {
      if (updatedPerson ) {
        response.json(updatedPerson )
      } else {
        response.status(404).end()
      }
      })
      .catch(error => next(error))
    })
 
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
  .then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
  })

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({ 
          error: 'name or number is missing' 
        })
      }
      
    /*if (persons.find(person => person.name === body.name)) {
        return response.status(400).json({ 
          error: 'name must be unique' 
        })
      } 
    */
    const person = new Person({
      name: body.name,
      number: body.number,
    })
    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
   
  })

  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  app.use(unknownEndpoint)


  const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    }else if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    }
  
    next(error)
  }
  app.use(errorHandler)  

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})