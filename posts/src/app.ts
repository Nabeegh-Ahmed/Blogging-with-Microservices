import express from 'express'
import {randomBytes} from 'crypto'
import cors from 'cors'
import axios from 'axios'

const app = express()
app.use(express.json())
app.use(cors());

// Yes this is totally temporary. I am just getting a taste
// of microservices arcitecture

interface IPost {
    id: string
    title: string
}

const posts: { [id: string]: IPost } = {}

app.get('/status', (req, res) => {
    res.send("Posts Service Running")
})

app.get('/posts', (req, res) => {
    res.send(posts);
});

app.post('/posts/create', async (req, res) => {
    try {
        const { title } = req.body;
        const id = randomBytes(4).toString('hex');
        posts[id] = {id, title}
        
        await axios.post('http://event-bus-srv:5005/events', {
            type: 'PostCreated',
            data: {
                id,
                title
            }
        });

        res.status(201).send(posts[id])
    } catch (err) {
        res.status(400).send(err)
    }
    
})

app.post('/events', (req, res) => {
    console.log('Received Event at POSTS Service', req.body.type)
    res.send({})
});

app.listen(5000, () => console.log("Posts server started at PORT 5000"))