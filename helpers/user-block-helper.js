var db = require('../config/connection')
var collection = require('../config/collection')
const ObjectId = require('mongodb').ObjectID

module.exports = {
  viewAllUserDetails: () => {
    return new Promise((resolve, reject) => {
      let allUsers = db.get().collection(collection.USER_COLLECTION).find().toArray()
      resolve(allUsers)
    })
  },


  blockUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, { $set: { Block:true} })
      resolve()
    })
  },


  unBlockUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, { $set: { Block:false} })
      resolve()
    })
  }


}