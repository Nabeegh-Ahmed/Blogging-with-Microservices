import express from 'express'
import cors from 'cors'
import axios from 'axios'

import {IPost, IEventData} from './types'

const app = express()
app.use(express.json())
app.use(cors())

const posts: { [id: string] : IPost } = {}

app.get('/status', (req, res) => {
    res.send("Query Service Running")
})

const handleEvent = (type: string, data: IEventData) => {
    if (type === 'PostCreated') {
        const { id, title } = data
        posts[id] = { id, title, comments: [] }
    }

    if (type === 'CommentCreated') {
        const { id, content, postId, status } = data
        const post = posts[postId]
        post.comments.push({ id, content, status })
    }

    if (type === 'CommentUpdated') {
        const { id, content, postId, status } = data
        const post = posts[postId]
        
        const comment = post.comments.find(comment => {
            return comment.id === id
        });

        if (comment) {
            comment.status = status
            comment.content = content
        }
    }
}

app.get('/posts', (req, res) => {
    res.send(posts)
})
  
app.post('/events', (req, res) => {
    const { type, data } = req.body
    handleEvent(type, data)
    res.send({})
})

app.listen(5002, async () => {
    console.log("Query server started at PORT 5002")
    const res = await axios.get('http://localhost:5005/events');

    for (let event of res.data) {
        console.log('Processing event:', event.type);
        handleEvent(event.type, event.data);
    }
})