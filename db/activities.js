const client = require("./client");

// database functions
async function createActivity({ name, description }) {
  // return the new activity
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
    INSERT INTO activities(name, description)
    VALUES ($1, $2)
    ON CONFLICT (name) DO NOTHING
    RETURNING *;
    `,
      [name, description]
    );

    return activity;
  } catch (error) {
    throw error;
  }
}

async function getAllActivities() {
  try {
    const { rows } = await client.query(
      `
    SELECT *
    FROM activities;
    `
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getActivityById(id) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
  SELECT *
  FROM activities
  WHERE id = $1;
  `,
      [id]
    );

    if (!activity) {
      return null;
    }

    return activity;
  } catch (error) {
    throw error;
  }
}

async function getActivityByName(name) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
  SELECT *
  FROM activities
  WHERE name = $1;
  `,
      [name]
    );

    if (!activity) {
      return null;
    }

    return activity;
  } catch (error) {
    throw error;
  }
}

// used as a helper inside db/routines.js

async function attachActivitiesToRoutines(routines) {
  for (let routine of routines) {
    const routineId = routine.id;
    const res = await client.query(
      `
      SELECT activities.*, duration, count, "routineId", routine_activities.id as "routineActivityId"
      FROM routine_activities
      JOIN activities ON "activityId" = activities.id
      WHERE "routineId" = $1
      `,
      [routineId]
    );

    routine.activities = res.rows;
  }
}

async function updateActivity({ id, ...fields }) {
  try {
    const setString = Object.keys(fields)
      .map((key, index) => `"${key}"=$${index + 1}`)
      .join(", ");

    const {
      rows: [activity],
    } = await client.query(
      `
    UPDATE activities
    SET ${setString}
    WHERE id = ${id}
    RETURNING *;
    `,
      Object.values(fields)
    );

    return activity;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
