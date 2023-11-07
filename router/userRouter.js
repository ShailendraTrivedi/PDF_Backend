const express = require("express");
const UserModel = require("../schema/userSchema");

const UserRouter = express.Router();

UserRouter.post("/signup", async (req, res) => {
  try {
    const { userName, userEmail, userPassword } = req.body;
    const existingUser = await UserModel.findOne({ userEmail });

    if (existingUser) {
      return res.status(409).json({ error: "User already exists." });
    }

    const newUser = new UserModel({ userEmail, userName, userPassword });
    await newUser.save();

    return res.status(201).json({
      message: "Account created successfully",
      result: newUser.userEmail,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

UserRouter.post("/signin", async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body;
    const existingUser = await UserModel.findOne({ userEmail });

    if (!existingUser) {
      return res.status(404).json({ error: "User does not exist" });
    }

    if (existingUser.userPassword !== userPassword) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    return res.status(200).json({
      message: "Logged in successfully",
      result: existingUser.userEmail,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = UserRouter;
