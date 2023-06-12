const express = require("express");
const router = express.Router();
const loggedIn = require("./middleware.js");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
  getRoutineActivitiesByRoutine,
  addActivityToRoutine,
} = require("../db");

// GET /api/routines
router.get("/", async (req, res, next) => {
  try {
    const routines = await getAllPublicRoutines();
    res.status(200).json(routines);
  } catch (error) {
    next(error);
  }
});

// POST /api/routines
router.post("/", loggedIn, async (req, res, next) => {
  const creatorId = req.user;

  if (!creatorId) {
    return next({
      name: "Unauthorized User",
      message: "You must be logged in to perform this action",
      error: "Unauthorized User Error",
    });
  }

  try {
    const routine = await createRoutine({
      creatorId: req.user.id,
      ...req.body,
    });
    res.status(200).json(routine);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/routines/:routineId
router.patch("/:routineId", loggedIn, async (req, res, next) => {
  const routineId = req.params.routineId;
  const creatorId = req.user;

  if (!creatorId) {
    return next({
      name: "Unauthorized User",
      message: "You must be logged in to perform this action",
      error: "Unauthorized User Error",
    });
  }

  try {
    const { isPublic, name, goal } = req.body;
    const routine = await updateRoutine({ routineId, isPublic, name, goal });

    if (routine.creatorId !== req.user.id) {
      res.status(403).json({
        error: "AuthorizationHeaderError",
        name: "Error",
        message: `User ${req.user.username} is not allowed to update Every day`,
      });
    } else {
      res.send(routine);
    }
  } catch (error) {
    next(error);
  }
});

// DELETE /api/routines/:routineId
router.delete("/:routineId", loggedIn, async (req, res, next) => {
  const { routineId } = req.params;
  try {
    const routine = await getRoutineById(routineId);
    if (routine.creatorId !== req.user.id) {
      res.status(403).json({
        error: "AuthorizationHeaderError",
        name: "Error",
        message: `User ${req.user.username} is not allowed to delete ${routine.name}`,
      });
      return;
    }
    const deletedRoutine = await destroyRoutine(routineId);
    res.status(200).json(deletedRoutine);
  } catch (error) {
    next(error);
  }
});

// POST /api/routines/:routineId/activities

// router.post("/:routineId/activities", async (req, res, next) => {
//   const id = req.params.routineId;
//   const { routineId, activityId, count, duration } = req.body;
//   const check = await getRoutineActivitiesByRoutine({ id });

//   try {
//     check.map((activity) => {
//       if (activity.activityId == activityId) {
//         next({
//           name: "This routine exists already.",
//           message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`,
//           error: "Duplicate Routine Activity Error",
//         });
//       }
//     });
//     const addActivity = await addActivityToRoutine({
//       routineId,
//       activityId,
//       count,
//       duration,
//     });
//     res.send(addActivity);
//   } catch (error) {
//     next(error);
//   }
// });

router.post("/:routineId/activities", async (req, res, next) => {
  const { routineId, activityId, count, duration } = req.body;
  const id = req.params.routineId;
  const routines = await getRoutineActivitiesByRoutine({ id });

  try {
    routines.map((activity) => {
      if (activity.activityId == activityId) {
        next({
          name: "This routine exists already.",
          message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`,
          error: "Duplicate Routine Activity Error",
        });
      }
    });

    const routineActivity = await addActivityToRoutine(req.body);
    res.send(routineActivity);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
