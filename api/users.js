const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { token } = require("morgan");
const { JWT_SECRET } = process.env;
const loggedIn = require("./middleware.js");

const {
  getAllRoutinesByUser,
  createUser,
  getUser,
  getUserByUsername,
  getPublicRoutinesByUser,
} = require("../db");

// POST /api/users/register

router.post("/register", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const _user = await getUserByUsername(username);
    if (_user) {
      next({
        error: "user ${_user} is already taken",
        name: "UserExistsError",
        message: `User ${username} is already taken.`,
      });

      return;
    }

    if (password.length < 8) {
      next({
        error: "Password must be at least 8 characters long.",
        name: "PasswordLengthError",
        message: "Password Too Short!",
      });
      return;
    }

    const user = await createUser({
      username,
      password,
    });

    const token = jwt.sign(
      {
        id: user.id,
        username,
      },
      process.env.JWT_SECRET
    );

    res.send({
      message: "hello",
      user,
      token,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// POST /api/users/login

router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      next({
        name: "UserDoesNotExist",
        message: "User does not exist",
      });
    }

    const user = await getUser({ username, password });
    if (user) {
      const token = jwt.sign(
        { active: true, id: user.id, username: user.username },
        process.env.JWT_SECRET
      );

      res.send({ message: "you're logged in!", token, user });
    } else {
      next({
        name: "Invalid User",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/users/me

router.get("/me", async (req, res, next) => {
  const bearer = "Bearer ";
  const auth = req.headers.authorization;
  let token;

  if (auth) {
    token = auth.slice(bearer.length);
  }

  if (!token) {
    res.status(401);
    next({
      name: "UnauthorizedError",
      message: "You must be logged in to perform this action",
      error: "UnauthorizedError",
    });
  }

  try {
    const { id, username } = jwt.verify(token, process.env.JWT_SECRET);

    res.send({ id, username, active: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:username/routines

router.get("/:username/routines", loggedIn, async (req, res, next) => {
  const { username } = req.params;

  try {
    if (req.user.username === username) {
      const routines = await getAllRoutinesByUser({ username });
      res.status(200).json(routines);
    } else {
      const routines = await getPublicRoutinesByUser({ username });
      res.status(200).json(routines);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
