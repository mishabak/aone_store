
var collection = require('../config/collection')
var db = require('../config/connection')
var bcrypt = require('bcrypt')


module.exports = {

    
    adminLogin: (adminData) => {
        var response={}
        return new Promise(async (resolve, reject) => {
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Email: adminData.Email })
            if (admin) {
                bcrypt.compare(adminData.Password, admin.Password).then((status) => {
                    if(status){
                        response.admin=admin
                        response.status =status                     
                        resolve(response)
                    }else{
                        resolve(status=false)
                    }
                })
            }else{
                resolve(status=false)
            }
        })
    }


}