import express from 'express';
import cors from 'cors';
import ImageKit from 'imagekit';
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from "@google/generative-ai"
import Chat from "./models/chat.js";
import UserChats from "./models/userChats.js";
import {requireAuth} from "@clerk/express";

const port = process.env.PORT || 3000;
const app = express();


app.use(
  cors({
  origin: process.env.CLIENT_URL,
  credentials: true
})
);

app.use(express.json());
const connect = async () => {
  try{
    await mongoose.connect(process.env.MONGO)
    console.log("MongoDB connected")
  } catch(err) {
    console.log(err)
  }
}

const imagekit = new ImageKit({
    urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
    publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
    privateKey: process.env.IMAGE_KIT_PRIVATE_KEY
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/gemini", async (req, res) => {
  try {
     console.log(req.body);
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini API failed" });
  }
})

app.get("/api/upload", (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
});

// app.get("/api/test", requireAuth(),(req,res) => {
//   const userId = req.auth.userId;
//   console.log(userId)
//   res.send("Success!")
// })

app.post("/api/chats",requireAuth(),async (req, res) => {
  const userId = req.auth.userId;
  const { text} = req.body
  console.log(userId, text)

  try{
    //create a new chat
    const newChat = new Chat ({
      userId: userId,
      history: [{role:"user", parts:[{text}]}]
    })
    
    const savedChat = await newChat.save();

    //check if user chat exist
    const userChats = await UserChats.find({userId: userId});

    if(!userChats.length) {
      const newUserChats = new UserChats ({
        userId: userId,
        chats: [
          {
          _id: savedChat.id,
          title: text.substring(0, 40),
        }
        ]
      });

      await newUserChats.save()
    } else {

      await UserChats.updateOne(
        {userId: userId},
        {
        $push:{
          chats: {
          _id:  savedChat._id,
          title: text.substring(0, 40),
        },
      },
      }
      );

      res.status(201).send(newChat._id);
    }
  } catch(err) {
    console.log(err)
    res.status(500).send("Error creating chat!")
  } 
});

app.get("/api/userchats", requireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  console.log(userId)

  try{
    const userChats = await UserChats.find({userId})

    res.status(200).send(userChats[0].chats);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching userchats!")
  } 
});

app.get("/api/chats/:id", requireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  try{
    const chat = await Chat.findOne({ _id: req.params.id, userId})

    res.status(200).send(chat);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching chat!")
  } 
});

app.use((err, req,res,next) => {
  console.error(err.stack);
  res.status(401).send('Unauthenticated');
});

connect();

app.listen(port, () => {
  console.log("Server is running on 3000");
});



