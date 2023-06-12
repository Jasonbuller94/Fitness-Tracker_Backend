const express = require("express");
const router = express.Router();
const loggedIn = require("./middleware.js");
const { getPublicRoutinesByActivity } = require("../db");
const {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
} = require("../db");

// GET /api/activities/:activityId/routines

router.get("/:activityId/routines", async (req, res, next) => {
  try {
    const { activityId } = req.params;
    const activity = await getActivityById(activityId);

    if (activity) {
      const publicRoutines = await getPublicRoutinesByActivity({
        id: activityId,
      });
      res.send(publicRoutines);
    }

    if (!activity) {
      next({
        error: "Did not find activity",
        message: `Activity ${activityId} not found`,
        name: "Activity Not Found",
      });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/activities

router.get("/", async (req, res, next) => {
  try {
    const allActivities = await getAllActivities();
    res.send(allActivities);
  } catch (error) {
    next(error);
  }
});

// POST /api/activities

router.post("/", loggedIn, async (req, res, next) => {
  const { name, description } = req.body;

  if (name && (await getActivityByName(name))) {
    next({
      name: "Activity already exists",
      message: `An activity with name ${name} already exists`,
      error: "Activity Exists Error",
    });
  }

  try {
    const newActivity = await createActivity({ name, description });

    res.send(newActivity);
  } catch (error) {
    throw error;
  }
});

// PATCH /api/activities/:activityId

router.patch("/:activityId", async (req, res, next) => {
  const id = req.params.activityId;
  const { name, description } = req.body;
  const updateTheDetails = { id: id };
  const thisActivityExists = await getActivityById(id);

  if (name) {
    updateTheDetails.name = name;
    if (await getActivityByName(name)) {
      next({
        name: "Activity already exists",
        message: `An activity with name ${name} already exists`,
        error: "Activity Exists Error",
      });
    }
  }
  if (description) {
    updateTheDetails.description = description;
  }
  try {
    if (!thisActivityExists) {
      next({
        name: "This activity was not found",
        message: `Activity ${id} not found`,
        error: "Activity Not Found",
      });
    } else if (thisActivityExists) {
      const updatedActivity = await updateActivity(updateTheDetails);
      res.send(updatedActivity);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
