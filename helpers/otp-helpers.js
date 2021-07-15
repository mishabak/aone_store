var db = require('../config/connection')
var collection = require('../config/collection')
require('dotenv').config()
const accountSid =process.env.twilio_AccountSid
const authToken =process.env.twilio_AuthToken
const client = require('twilio')(accountSid, authToken);

module.exports = {

    otpVerification: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ Phone: data }).then((response) => {
                resolve(response)
            })
        })
    },

    sendMessage: (number) => {
        return new Promise(async (resolve, reject) => {
            await client.verify.services(process.env.twilio_ServiceId)
                .verifications
                .create({ to:number, channel: 'sms' })
                .then(verification => console.log(verification.status));
            resolve()
        })

    },


    compareOtp: (result) => {
        return new Promise(async (resolve, reject) => {
            await client.verify.services(process.env.twilio_ServiceId)
                .verificationChecks
                .create({ to:result.phone, code: result.otp })
                .then((data) => {
                    resolve(data)
                });
        })
    },


    findUserByOtp: (data) => {
        return new Promise(async (resolve, reject) => {
            var details = await db.get().collection(collection.USER_COLLECTION).findOne({ Phone: data })
            resolve(details)
        })
    }

}

