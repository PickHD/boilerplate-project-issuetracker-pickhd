'use strict';

const Issue = require("../models/Issue")

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(async (req, res) => {
      const { project } = req.params
      const { issue_text, issue_title, created_by, assigned_to, status_text, open, created_on, updated_on, _id } = req.query
      let getIssues

      try {

        if (issue_text === undefined && issue_title === undefined && created_by === undefined && assigned_to === undefined && status_text === undefined && open === undefined && created_on === undefined && updated_on === undefined && _id === undefined) {

          getIssues = await Issue.find({ project: project }).select("-__v -project")

        } else if (assigned_to !== undefined && created_by !== undefined) {

          getIssues = await Issue.find({ $and: [{ assigned_to: assigned_to, project: project }, { created_by: created_by, project }] }).select("-__v -project")

        } else {
          getIssues = await Issue.find({ project: project }).or([{ issue_text: issue_text }, { issue_title: issue_title }, { created_by: created_by }, { assigned_to: assigned_to }, { status_text: status_text }, { open: open }, { created_on: created_on }, { updated_on: updated_on }, { _id: _id }]).select("-__v -project")
        }
        return res.status(200).json(getIssues)

      } catch (e) {
        return res.status(200).json({
          error: "could not retrieve"
        })
      }
    })

    .post(async (req, res) => {
      const { project } = req.params
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body
      try {

        if (issue_title === undefined || issue_text === undefined || created_by === undefined) {
          return res.status(200).json({ error: "required field(s) missing" })
        }

        const createIssue = await Issue.create({
          issue_title: issue_title,
          issue_text: issue_text,
          created_by: created_by,
          project: project,
          assigned_to: assigned_to === undefined ? "" : assigned_to,
          status_text: status_text === undefined ? "" : status_text
        });

        return res.status(200).json({
          assigned_to: createIssue.assigned_to,
          status_text: createIssue.status_text,
          open: createIssue.open,
          _id: createIssue._id,
          issue_title: createIssue.issue_title,
          issue_text: createIssue.issue_text,
          created_by: createIssue.created_by,
          created_on: createIssue.created_on,
          updated_on: createIssue.updated_on,
        })

      } catch (e) {
        return res.status(200).json({
          error: "could not create"
        })
      }

    })

    .put(async (req, res) => {
      const { project } = req.params
      const { _id ,issue_text,issue_title,created_by} = req.body
      try {

        if (!_id || _id === "" || _id === undefined) {
          return res.status(200).json({ error: "missing _id" })
        }

        const updIssue = await Issue.updateOne({ _id: _id, project: project }, req.body, { rawResult: true })

        if (updIssue.nModified === 0 &&(issue_text!==undefined||issue_title!==undefined||created_by!==undefined)) {
          return res.status(200).json({ error: "could not update", '_id': _id })
        }

        if (updIssue.nModified === 0) {
          return res.status(200).json({ error: "no update field(s) sent", '_id': _id })
        } else {
          //!update timestamp manually, cuz above code behaviour is shit 
          await Issue.updateOne({ _id: _id }, { updated_on: new Date() }, { rawResult: true, upsert: true })
          return res.status(200).json({ result: "successfully updated", '_id': _id })
        }

      } catch (e) {
        return res.status(200).json({
          error: "could not update",
          '_id': _id
        })
      }
    })

    .delete(async (req, res) => {
      const { project } = req.params
      const { _id } = req.body
      try {
        if (!_id || _id === "" || !_id === undefined) {
          return res.status(200).json({ error: "missing _id" })
        }

        const delIssue = await Issue.deleteOne({ _id: _id, project: project }, { rawResult: true })

        if (delIssue.deletedCount === 0) {
          return res.status(200).json({
            error: "could not delete",
            '_id': _id
          })
        }

        return res.status(200).json({ result: "successfully deleted", '_id': _id })

      } catch (e) {
        return res.status(200).json({
          error: "could not delete",
          '_id': _id
        })
      }
    })

};
