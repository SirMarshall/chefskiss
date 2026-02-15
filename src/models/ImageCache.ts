import mongoose, { Schema, model, models } from "mongoose";

const ImageCacheSchema = new Schema({
    query: { type: String, required: true, unique: true, index: true },
    imageUrl: { type: String, required: true },
    imageBlurHash: { type: String },
    imageUserName: { type: String },
    imageUserLink: { type: String },
    expiresAt: { type: Date, required: true, expires: 0 } // TTL index
}, {
    timestamps: true,
    collection: 'image_cache'
});

const ImageCache = models.ImageCache || model("ImageCache", ImageCacheSchema);

export default ImageCache;
