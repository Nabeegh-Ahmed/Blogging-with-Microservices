import express from 'express'
import cors from 'cors'
import axios from 'axios'

const app = express()
app.use(express.json())
app.use(cors());

app.get('/status', (req, res) => {
    res.send("Event Bus Running")
})

const events: any[] = []

app.post('/events', (req, res) => {
    const event = req.body

    events.push(event)

    axios.post('http://localhost:5000/events', event)
    axios.post('http://localhost:5001/events', event)
    axios.post('http://localhost:5002/events', event)
    axios.post('http://localhost:5003/events', event)

    res.send({ status: 'OK' });
});

app.get('/events', (req, res) => {
    res.send(events)
})

app.listen(5005, () => {
  console.log('Event Bus running on PORT 5005')
});
