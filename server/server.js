import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";

//to use .env variables
dotenv.config();

const configuration = new Configuration ({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

//initialize express application
const app = express();

//set some middlewares
app.use(cors());

//pass json from the frontend to the backend
app.use(express.json());

//dummy root route
app.get("/", async (req, res) => {
    res.status(200).send({
        message: "Hello from Chatext",
    })
});


app.post("/", async (req, res) => {
    try {
        const prompt = req.body.prompt;

        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `${prompt}`, //from our prompt
            temperature: 0, //refer to risk taking, set 0 so that i just answer what it knows
            max_tokens: 3000, //set how long responses it can give
            top_p: 1,
            frequency_penalty: 0.5, //control repetitive answers for same questions
            presence_penalty: 0,
        });

        //after get response, send data to frontend
        res.status(200).send({
            bot: response.data.choices[0].text
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ error });
    }
});

//check server always listen to our request
app.listen(5000, () => console.log("Server is running on port http://localhost:5000"));