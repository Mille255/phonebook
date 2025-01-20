const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(morgan('tiny'))
app.use(express.json())
app.use(cors())

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
      },
      {
        id: "2",
        name: "Ada Lovelace",
        number: "39-44-5323523"
      },
      {
        id: "3",
        name: "Dan Abramov",
        number: "12-43-234345"
      },
      {
        id: "4",
        name: "Mary Poppendieck",
        number: "39-23-64233122"
      }
             
]


app.get('/info', (request, response) => {
    const currentTime = new Date()
    const number = persons.length 
    response.send(`
  <p>Phonebook has info for ${number} people</p>
  <p>${currentTime}</p>
`)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
   })

  
app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)

    if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
  })

  app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
  })

  const generateId = () => {
    const max = 1000;
    return Math.floor(Math.random() * max);
  }
  
  app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({ 
          error: 'name or number is missing' 
        })
      }

    if (persons.find(person => person.name === body.name)) {
        return response.status(400).json({ 
          error: 'name must be unique' 
        })
      } 
    
    const person = {
    id: generateId(),        
    name: body.name,
    number: body.number,
    }

    persons = persons.concat(person)
    console.log(person)
    response.json(person)
  })

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})