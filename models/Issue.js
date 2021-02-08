const {Schema,model} = require("mongoose")

const IssueSchema = Schema({
  issue_title: {
    type: String
  },
  issue_text: {
    type: String
  },
  created_by: {
    type: String
  },
  assigned_to: {
    type:String,
    default:""
  },
  status_text: {
    type:String,
    default:""
  },
  project:String,
  open: {
    type:Boolean,
    default:true
  },
  created_on:{
    type:Date,
    default:Date.now
  },
  updated_on:{
    type:Date,
    default:Date.now
  }
})

const Issue = model("Issue", IssueSchema)

module.exports=Issue