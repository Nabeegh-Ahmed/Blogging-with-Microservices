export interface IComment {
    id: string
    content: string
    status: string
}

export interface IPost {
    id: string
    title: string
    comments: IComment[]
}

export interface IEventData {
    id: string
    title: string
    content: string
    postId: string
    status: string
}