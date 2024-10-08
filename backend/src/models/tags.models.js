import mongoose from "mongoose"

const tagSchema = new mongoose.Schema({
    type: String,
    enum: ['Science And Technology', 'Social Media', 'Life', 'Health', 'Sports', 'Politics'],
    required: true
},{timestamps: true})

export const Tag = mongoose.model('Tag', tagSchema)