const chaiHttp = require('chai-http')
const chai = require('chai')
const { assert } = chai
const app = require('../server')
const Issue = require("../models/Issue")

chai.use(chaiHttp)

suite('Functional Tests', () => {
  suite('POST => create issues', () => {
    teardown((done) => {
      Issue.deleteMany({ open: true })
        .then(() => done())
        .catch(e => done(e))
    })
    test("Create an issue with every field", (done) => {
      chai
        .request(app)
        .post("/api/issues/apitest")
        .send({
          issue_title: "Bug while creating issues",
          issue_text: "when i created issues like this,my browser become laggy",
          created_by: "PickHD",
          assigned_to: "PickEz",
          status_text: "In Queue"
        })
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.type, "application/json")
          assert.equal(res.body.assigned_to, "PickEz")
          assert.equal(res.body.status_text, "In Queue")
          assert.equal(res.body.open, true)
          assert.exists(res.body._id)
          assert.equal(res.body.issue_title, "Bug while creating issues")
          assert.equal(res.body.issue_text, "when i created issues like this,my browser become laggy")
          done()
        })
    })

    test("Create an issue with only required fields", (done) => {
      chai
        .request(app)
        .post("/api/issues/apitest")
        .send({
          issue_title: "Bug while creating issues #2",
          issue_text: "when i created issues like this,my browser become laggy",
          created_by: "Duar22",
          assigned_to: "",
          status_text: ""
        })
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.type, "application/json")
          assert.equal(res.body.assigned_to, "")
          assert.equal(res.body.status_text, "")
          done()
        })
    })
    test("Create an issue with missing required fields", (done) => {
      chai
        .request(app)
        .post("/api/issues/apitest")
        .send({
          issue_title: "",
          issue_text: "when i created issues like this,my browser become choppy"
        })
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.type, "application/json")
          assert.isUndefined(res.body.issue_title)
          assert.isUndefined(res.body.issue_text)
          assert.equal(res.body.error, "required field(s) missing")
          done()
        })
    })

  })
 suite('GET => retrieve issues', () => {
    setup((done) => {
      Issue.create(
        [{
          issue_title: "Bug while creating issues",
          issue_text: "when i created issues like this,my browser become choppy",
          created_by: "Pick",
          assigned_to:"Ez",
          project: "apitest"
        }, {
          issue_title: "Bug while creating issues #2",
          issue_text: "when i created issues like this,my browser become laggy",
          created_by: "Pick",
          assigned_to:"Too",
          project: "apitest"
        }]
      ).then(() => done())
        .catch(e => done(e))
    })
    teardown((done) => {
      Issue.deleteMany({ created_by: /Pick|PickEz/ })
        .then(() => done())
        .catch(e => done(e))
    })
    test("View issues on a project", (done) => {
      chai
        .request(app)
        .get("/api/issues/apitest")
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.type, "application/json")
          assert.equal(res.body[0].issue_title, "Bug while creating issues")
          assert.equal(res.body[0].issue_text, "when i created issues like this,my browser become choppy")
          done()
        })
    })
    test("View issues on a project with one filter", (done) => {
      chai
        .request(app)
        .get("/api/issues/apitest?open=true")
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.type, "application/json")
          assert.equal(res.body.length, 2)
          assert.isTrue(res.body[0].open)
          assert.isTrue(res.body[1].open)
          done()
        })
    })
    test("View issues on a project with multiple filters", (done) => {
      chai
        .request(app)
        .get("/api/issues/apitest?created_by=Pick&assigned_to=Ez")
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.type, "application/json")
          assert.equal(res.body.length, 1)
          assert.isTrue(res.body[0].open)
          assert.equal(res.body[0].created_by, "Pick")
          assert.equal(res.body[0].assigned_to, "Ez")
          done()
        })
    })
  }) 
  suite('PUT => update issues', () => {
    let getId
    setup((done) => {
      Issue.create({
        issue_title: "Bug while creating issues",
        issue_text: "when i created issues like this,my browser become choppy",
        created_by: "Pick",
        project:"apitest"
      })
        .then((issue) => {
          getId = issue._id
          done()
        })
        .catch(e => done(e))
    })
    teardown((done) => {
      Issue.findByIdAndRemove(getId)
        .then(() => done())
        .catch(e => done(e))
    })

    test("Update one field on an issue", (done) => {
      chai
        .request(app)
        .put("/api/issues/apitest")
        .send({
          _id: getId,
          created_by: "PickEz"
        })
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.type, "application/json")
          assert.equal(res.body.result, "successfully updated")
          assert.equal(res.body._id, getId)
          done()
        })
    })
    test("Update multiple fields on an issue", (done) => {
      chai
        .request(app)
        .put("/api/issues/apitest")
        .send({
          _id: getId,
          created_by: "Pick",
          issue_title: "Bug while updating issues"
        })
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.type, "application/json")
          assert.equal(res.body.result, "successfully updated")
          assert.equal(res.body._id, getId)
          done()
        })
    })
    test("Update an issue with missing _id", (done) => {
      chai
        .request(app)
        .put("/api/issues/apitest")
        .send({
          created_by: "Pick",
          issue_title: "Bug while updating issues"
        })
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.type, "application/json")
          assert.equal(res.body.error, "missing _id")
          done()
        })
    })
    test("Update an issue with no fields to update", (done) => {
      chai
        .request(app)
        .put("/api/issues/apitest")
        .send({
          _id: getId
        })
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.type, "application/json")
          assert.equal(res.body.error, "no update field(s) sent")
          assert.equal(res.body._id, getId)
          done()
        })
    })
    test("Update an issue with an invalid _id", (done) => {
      chai
        .request(app)
        .put("/api/issues/apitest")
        .send({
          _id: "601d198e2a078eb2b828d990",
          created_by: "Pick",
          issue_title: "Bug while updating issues"
        })
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.type, "application/json")
          assert.equal(res.body.error, "could not update")
          assert.equal(res.body._id, "601d198e2a078eb2b828d990")
          done()
        })
    })
  })
  suite('DELETE => delete issues', () => {
    let getId
    setup((done) => {
      Issue.create({
        issue_title: "Bug while creating issues",
        issue_text: "when i created issues like this,my browser become choppy",
        created_by: "Pick",
        project:"apitest"
      })
        .then((issue) => {
          getId = issue._id
          done()
        })
        .catch(e => done(e))
    })
    teardown((done) => {
      Issue.deleteOne({ _id: getId })
        .then(() => done())
        .catch(e => done(e))
    })
    test("Delete an issue", (done) => {
      chai
        .request(app)
        .delete("/api/issues/apitest")
        .send({
          _id: getId
        })
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.type, "application/json")
          assert.isUndefined(res.body.issue_title)
          assert.isUndefined(res.body.issue_text)
          assert.isUndefined(res.body.created_by)
          assert.equal(res.body.result, "successfully deleted")
          done()
        })

    })
    test("Delete an issue with an invalid _id", (done) => {
      chai
        .request(app)
        .delete("/api/issues/apitest")
        .send({
          _id: "5f4b22427c2887002278eda6"
        })
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.type, "application/json")
          assert.equal(res.body.error, "could not delete")
          assert.equal(res.body._id, "5f4b22427c2887002278eda6")
          done()
        })
    })
    test("Delete an issue with missing _id", (done) => {
      chai
        .request(app)
        .delete("/api/issues/apitest")
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.type, "application/json")
          assert.equal(res.body.error, "missing _id")
          assert.isUndefined(res.body._id)
          assert.notExists(res.body._id)
          done()
        })
    })
  })
});
