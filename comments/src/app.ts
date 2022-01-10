import express from 'express'
import {randomBytes} from 'crypto'
import cors from 'cors'
import axios from 'axios'

const app = express()
app.use(express.json())
app.use(cors())

interface IComment {
    id: string
    content: string
    status: string
}

const comments: { [id: string] : [IComment] } = {}

app.get('/status', (req, res) => {
    res.send("Comments Service Running")
})

app.get('/posts/:id/comments', (req, res) => {
    res.send(comments[req.params.id] || []);
});

app.post("/posts/:id/comments", async(req, res) => {
    try {
        const commentId = randomBytes(4).toString('hex');
        const { content } = req.body;

        const commentsForPost = comments[req.params.id] || [];

        commentsForPost.push({ id: commentId, content: content, status: 'pending' });

        comments[req.params.id] = commentsForPost;

        await axios.post('http://event-bus-srv:5005/events', {
            type: 'CommentCreated',
            data: {
                id: commentId,
                content,
                postId: req.params.id,
                status: 'pending'
            }
        });

        res.status(201).send(commentsForPost);
    } catch (err) {
        res.status(400).send(err)
    }
})

app.post('/events', async (req, res) => {
    console.log('Event Received:', req.body.type);

    const { type, data } = req.body;

    if (type === 'CommentModerated') {
        const { postId, id, status, content } = data
        const commentsForPost = comments[postId]

        const comment = commentsForPost.find(comment => {
            return comment.id === id;
        })

        if (comment) comment.status = status

        await axios.post('http://event-bus-srv:5005/events', {
            type: 'CommentUpdated',
            data: {
                id,
                status,
                postId,
                content
            }
        });
    }

    res.send({});
});

app.listen(5001, () => console.log("Comments server started at PORT 5001"))