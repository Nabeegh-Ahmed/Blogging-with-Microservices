import express from 'express'
import cors from 'cors'
import axios from 'axios'

const app = express()
app.use(express.json())
app.use(cors());

app.get('/status', (req, res) => {
    res.send("Moderation Service Running")
})

app.post('/events', async (req, res) => {
    const { type, data } = req.body
  
    if (type === 'CommentCreated') {
        const status = data.content.includes('orange') ? 'rejected' : 'approved'
        await axios.post('http://localhost:5005/events', {
            type: 'CommentModerated',
            data: {
                id: data.id,
                postId: data.postId,
                status,
                content: data.content
            }
        });
    }
    res.send({});
})

app.listen(5003, () => console.log("Moderation server started at PORT 5003"))