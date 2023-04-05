// hashing + salting password

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const User = require("./models/userModel");

const app = express();
const PORT = process.env.PORT || 5000;
const dbURL = process.env.MONGO_URL;

mongoose
  .connect(dbURL)
  .then(() => {
    console.log("mongodb atlas is connected");
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/./views/index.html");
});

// app.post("/register", async (req, res) => {
//   try {
//     bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
//       const newUser = new User({
//         email: req.body.email,
//         password: hash,
//       });
//       await newUser.save();
//       res.status(201).json(newUser);
//     });
//   } catch (error) {
//     res.status(500).json(error.message);
//   }
// });

app.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      email: req.body.email,
      password: passwordHash,
    });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (e) {
    res.status(500).send(e.toString());
  }
});
// app.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email: email });
//     console.log(user);
//     console.log(user.password);

//     if (!email || !password) {
//       return res.status(400).json({ error: "plz filled data" });
//     }

//     if (user) {
//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) {
//         res.status(400).json({ error: "invalid crendentials" });
//       } else {
//         res.json({ message: "user signin successfully" });
//       }
//     } else {
//       res.status(404).json({ status: "Not valid user" });
//     }
//   } catch (error) {
//     res.status(500).json(error.message);
//   }
// });
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(400).json("User Not Found!");
    }
    if (user) {
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          res.status(200).json({ status: "valid user" });
        }
      });
    }
    res.json({ message: "user signin successfully" });
  } catch (e) {
    console.log(e.toString());
  }
});

// route not found error
app.use((req, res, next) => {
  res.status(404).json({
    message: "route not found",
  });
});

//handling server error
app.use((err, req, res, next) => {
  res.status(500).json({
    message: "something broke",
  });
});

app.listen(PORT, () => {
  console.log(`server is running at http://localhost:${PORT}`);
});
