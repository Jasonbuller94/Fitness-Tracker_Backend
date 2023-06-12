const express = require("express");
const loggedIn = require("./middleware.js");
const router = express.Router();
const {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
} = require("../db");

// PATCH /api/routine_activities/:routineActivityId
router.patch("/:routineActivityId", loggedIn, async (req, res, next) => {
  const routineActivityId = req.params.routineActivityId;
  const user = req.user.id;

  if (!user) {
    return next({
      name: "AuthorizationHeaderError",
      message: "You need to log in to perform this action!",
    });
  }
  try {
    const routineOwner = await canEditRoutineActivity(routineActivityId, user);

    if (!routineOwner) {
      next({
        error: "Authorization Header",
        name: "You need to be the owner!",
        message: `User ${req.user.username} is not allowed to update In the evening`,
      });
    }
    const routineActivity = await updateRoutineActivity({
      id: routineActivityId,
      ...req.body,
    });
    res.send(routineActivity);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/routine_activities/:routineActivityId
router.delete("/:routineActivityId", loggedIn, async (req, res, next) => {
  const { routineActivityId } = req.params;
  const user = req.user.id;

  if (!user) {
    return next({
      name: "Authorization Header",
      message: "You need to log in to perform this action!",
    });
  }
  try {
    const routineOwner = await canEditRoutineActivity(routineActivityId, user);

    if (!routineOwner) {
      res.status(403).json({
        error: "Authorization Header ",
        message: `User ${req.user.username} is not allowed to delete In the afternoon`,
        name: "You need to be the owner!",
      });
    }

    const deletedRoutineActivity = await destroyRoutineActivity(
      routineActivityId
    );

    res.send(deletedRoutineActivity);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
