import {model,Schema} from "mongoose";

const schema = new Schema({
    from: String,
    to: String,
    message: String
});

export default model("Invite", schema);