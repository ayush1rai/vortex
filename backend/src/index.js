import connectDB from "./db/index.js";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config({
    path: './.env'
})

connectDB()
.then(() => {
    const port = process.env.PORT || 4000;
    app.listen(port, () => {
        console.log(`listening on port ${port}`);
    });
})
.catch((error) => {
   console.error("mongoDB could not be connected with expressJS. Error:- ", error);
  }
)