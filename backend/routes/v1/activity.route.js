'use strict'

const express = require('express');
const router = express.Router();

const { ensureAuth } = require("../../lib/auth");
const activityController = require("../../controllers/activity.controller");
const PATH = 'activity';

router.post(`/${PATH}/create`, ensureAuth, activityController.createActivity);
router.get(`/${PATH}/all/user`, ensureAuth, activityController.getActivitiesByUser);
router.get(`/${PATH}/all/:id`, ensureAuth, activityController.getActivities);
router.get(`/${PATH}/all/project/active/:id`, ensureAuth, activityController.getActiveActivities);
router.get(`/${PATH}/all/project/:id`, ensureAuth, activityController.getAllActivities);
router.get(`/${PATH}/backlog/:id`, ensureAuth, activityController.getBacklog);
router.get(`/${PATH}/:id`, ensureAuth, activityController.getActivity);
router.get(`/${PATH}/changes/:id`, ensureAuth, activityController.getChangesByActivity);
router.get(`/${PATH}/subactivities/:id`, ensureAuth, activityController.getSubactivitiesByActivity);
router.get(`/${PATH}/incidences/:id`, ensureAuth, activityController.getIncidencesByActivity);
router.put(`/${PATH}/update/:id`, ensureAuth, activityController.updateActivity);
router.put(`/${PATH}/delete/:id`, ensureAuth, activityController.deleteActivity);
router.put(`/${PATH}/discard/:id`, ensureAuth, activityController.discardActivity);

module.exports = router;
