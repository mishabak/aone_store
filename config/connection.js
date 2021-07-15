var mongoClient = require('mongodb').MongoClient
const state={
    db:null
} 
module.exports.connect=(callback)=>{
    const url = "mongodb://localhost:27017"
    const dbname = "A-one"
    mongoClient.connect(url,{useUnifiedTopology:true,useNewUrlParser:true},(err,data)=>{
        if(err)return callback(err)
        state.db=data.db(dbname)
        callback()
    })
}

module.exports.get=()=>state.db