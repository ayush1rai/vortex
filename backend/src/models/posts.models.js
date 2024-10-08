import mongoose from "mongoose"

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    tags: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comments: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }
},{timestamps: true})

export const Post = mongoose.model('Post', postSchema)