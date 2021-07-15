var db = require('../config/connection')
var collection = require('../config/collection')
var bcrypt = require('bcrypt')
const ObjectId = require('mongodb').ObjectID
var mongoose = require('mongoose')
require('dotenv').config()
const Razorpay = require('razorpay')
const { PayloadPage } = require('twilio/lib/rest/api/v2010/account/recording/addOnResult/payload')
const { ObjectID } = require('mongodb')
console.log(process.env.razorpay_Key_id);
var instance = new Razorpay({
  key_id:process.env.razorpay_Key_id,
  key_secret:process.env.razorpay_Key_secret,
});

module.exports = {


  userSignUp: (request) => {
    request.Block = false
    return new Promise(async (resolve, reject) => {
      request.Password = await bcrypt.hash(request.Password, 10)
      var user = await db.get().collection(collection.USER_COLLECTION).insertOne(request)
      resolve(user.ops[0],)
    })
  },

  userLogin: (request) => {
    return new Promise(async (resolve, reject) => {
      var response = {}
      currentUser = await db.get().collection(collection.USER_COLLECTION).findOne({ Phone: request.Phone })
      if (currentUser) {
        bcrypt.compare(request.Password, currentUser.Password).then((status) => {
          if (status) {
            response.status = true
            response.user = currentUser
            resolve(response)
          } else {
            response.status = false
            resolve(response)
          }
        })
      } else {
        response.status = false
        resolve(response)
      }
    })
  },


  userDetails: (userId) => {
    return new Promise(async (resolve, reject) => {
      var data = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) })
      resolve(data)
    })
  },


  validateUserDetails: (request) => {
    var response = {}
    return new Promise(async (resolve, reject) => {
      var Name = await db.get().collection(collection.USER_COLLECTION).findOne({ Name: request.Name })
      var Email = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: request.Email })
      var Phone = await db.get().collection(collection.USER_COLLECTION).findOne({ Phone: request.Phone })
      if (Name) {
        response.userName = true
      } else {
        response.userName = null
      }
      if (Email) {
        response.userEmail = true
      } else {
        response.userEmail = null
      }
      if (Phone) {
        response.userPhone = true
      } else {
        response.userPhone = null
      }
      if (response.userName || response.userEmail || response.userPhone) {
        reject(response)
      } else {
        resolve()
      }
    })
  },


  viewRandomProduct: () => {
    return new Promise(async (resolve, reject) => {
      var randomProduct = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([{ $sample: { size: 8 } }]).toArray()
      resolve(randomProduct)
    })
  },


  // viewProduct: () => {
  //     return new Promise(async (resolve, reject) => {
  //       var allProduct = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
  //       resolve(allProduct)
  //     })
  //   },


  viewCategory: () => {
    return new Promise(async (resolve, reject) => {
      var allcollection = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
      resolve(allcollection)

    })
  },


  productByCategory: (request) => {
    return new Promise(async (resolve, reject) => {
      var productByCategory = await db.get().collection(collection.PRODUCT_COLLECTION).find({ Category: request }).toArray()
      resolve(productByCategory)
    })
  },


  singleViewProducts: (id) => {
    return new Promise((resolve, reject) => {
      var result = db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(id) })
      resolve(result)
    })
  },


  productRelatedCategory: (category) => {
    return new Promise(async (resolve, reject) => {
      var productByCategory = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([{ $match: { Category: category } }, { $sample: { size: 8 } }]).toArray()
      resolve(productByCategory)
    })
  },



  // cart management  --->>


  addToCart: (productId, userId) => {
    let proObj = {
      item: ObjectId(productId),
      quantity: 1
    }
    return new Promise(async (resolve, reject) => {
      let userCart = await db.get().collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) })
      if (userCart) {
        let proExist = userCart.products.findIndex(product => product.item == productId)
        if (proExist != -1) {
          db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId), 'products.item': ObjectId(productId) },
            {
              $inc: { 'products.$.quantity': 1 }

            }).then(() => {
              resolve()
            })
        } else {
          db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId) },
            {
              $push: { products: proObj }
            }).then(() => {
              resolve()
            })
        }
      } else {
        let cartObj = {
          user: ObjectId(userId),
          products: [proObj]
        }
        db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
          resolve(response)
        })
      }
    })
  },


  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { user: ObjectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          },
        },
        {
          $project: {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
          }
        }

        // {
        //   $lookup: {
        //     from: collection.PRODUCT_COLLECTION,
        //     let: { prodList: '$products' },
        //     pipeline: [
        //       {
        //         $match: {
        //           $expr: {
        //             $in: ['$_id', "$$prodList"]
        //           }
        //         }
        //       }
        //     ],
        //     as: 'cartItems'
        //   }
        // }
      ]
      ).toArray()

      resolve(cartItems)
    })
  },


  getCartCount: (userId) => {
    let count = 0
    return new Promise(async (resolve, reject) => {
      let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
      if (cart) {
        count = cart.products.length
      }
      resolve(count)
    })
  },


  changeProductQuantity: (details) => {
    details.count = parseInt(details.count)
    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get().collection(collection.CART_COLLECTION)
          .updateOne({ _id: ObjectId(details.cart) },
            {
              $pull: { products: { item: ObjectId(details.product) } }
            }
          ).then((response) => {
            resolve({ removeProducts: true })
          })
      } else {
        db.get().collection(collection.CART_COLLECTION)
          .updateOne({ _id: ObjectId(details.cart), 'products.item': ObjectId(details.product) }, {
            $inc: { 'products.$.quantity': details.count }
          }).then((response) => {
            resolve({ removeProducts: false })
          })
      }
    })
  },


  deleteCartProduct: (details) => {
    console.log(details);
    return new Promise((resolve, reject) => {
      db.get().collection(collection.CART_COLLECTION)
        .updateOne({ _id: ObjectId(details.cart) },
          {
            $pull: { products: { item: ObjectId(details.product) } }
          }
        ).then((response) => {
          resolve({ removeProduct: true })
        })
    })
  },


  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { user: ObjectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          },
        },
        {
          $project: {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.Price' }] } }
          }
        }
      ]
      ).toArray()
      if (total.length > 0) {
        console.log(total)
        console.log(total[0].total)
        resolve(total[0].total)
      } else {

        resolve(total = 'cartEmpty')
      }

    })
  },


  //  payment ==>


  getCartProductList: async (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectID(userId) })
      resolve(cart.products)
    })
  },


  getTotalAmountOfProduct: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { user: ObjectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          },
        },
        {
          $project: {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.Price' }] } }
          }
        }
      ]
      ).toArray()
      resolve(total[0].total)
    })
  },
  placeOrder: (order, product, total) => {
    console.log(product)
    return new Promise((resolve, reject) => {
      let status = order['Payment-method'] === 'COD' ? 'placed' : 'placed'

      let orderObj = {
        deliveryDetails: {
          Name: order.Name,
          Mobile: order.Phone,
          Address: order.Address,
          Email: order.Email,
          City: order.city,
          State: order.State,
          Pincode: order.Pincode
        },
        Background: order.Background,
        UserId: ObjectId(order.userId),
        PaymentMethod: order['Payment-method'],
        Products: product,
        TotalAmount: total,
        Status: status,
        Date: new Date()
      }
      db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((data) => {
        db.get().collection(collection.CART_COLLECTION).removeOne({ user: ObjectId(order.userId) })
        resolve(data.ops[0]._id)
      })
    })
  },

  // save user payment details for next time
  saveUserDetails: (data) => {

    return new Promise((resolve, reject) => {
      let details = {
        user_details: {
          Name: data.Name,
          Email: data.Email,
          Address: data.Address,
          Phone: data.Phone,
          City: data.city,
          Pincode: data.Pincode,
          State: data.State,
        },
        userId: ObjectId(data.userId)
      }
      userId = data.userId
      db.get().collection(collection.PAYMENT_DETAILS).insertOne(details)
      resolve()
    })
  },


  findPaymentDetails: (userId) => {
    return new Promise(async (resolve, reject) => {
      var details = await db.get().collection(collection.PAYMENT_DETAILS).find({ userId: ObjectId(userId) }).toArray()
      resolve(details)
    })
  },




  // view order 
  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ UserId: ObjectId(userId) }).toArray()
      resolve(orders)
    })
  },


  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: { _id: ObjectId(orderId) }
        }
        ,
        {
          $unwind: '$Products'
        },
        {
          $project: {
            item: '$Products.item',
            quantity: '$Products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          },
        },
        {
          $project: {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
          }
        }
      ]
      ).toArray()
      resolve(orderItems)
    })
  },

  cancelOrder: (order) => {
    return new Promise(async (resolve, reject) => {
      var cancelOrder = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(order.orderId) }, { $set: { Status: 'cancelled', Background: order.backgroundColor } })
      resolve(cancelOrder)
    })
  },




  // razorpay ------------------------------->>>

  generateRazorpay: (orderId, total) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: total * 100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderId
      };
      instance.orders.create(options, function (err, order) {
        var data = {}
        data.order = order
        data.method = 'Razorpay'
        resolve(data)
      });
    })
  },
  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      const crypto = require('crypto');
      let hmac = crypto.createHmac('sha256', 'KgFuTsygNbWmya270UonrgBD');
      hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
      hmac = hmac.digest('hex')
      if (hmac == details['payment[razorpay_signature]']) {
        resolve()
      } else {
        reject()
      }
    })
  },



  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) },
        {
          $set: {
            status: 'placed'
          }
        }).then(() => {
          resolve()
        })
    })
  },



  // user details

  addUserDetails: (data) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_DETAILS).insertOne(data)
      resolve()
    })
  },


  findUserDetails: (data) => {
    return new Promise(async (resolve, reject) => {
      var response = await db.get().collection(collection.USER_DETAILS).aggregate([
        { $match: { userId: data } },
        { $project: { details_1: '$details_1', userId: '$userId' } }
      ]).toArray()
      resolve(response)
    })
  },


  editUserDetails: (userDetails) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.USER_DETAILS).updateOne({ userId: userDetails.userId },
        {
          $set:
          {
            details_1: {
              Name: userDetails.Name,
              Email: userDetails.Email,
              Address: userDetails.Address,
              Phone: userDetails.Phone,
              City: userDetails.City,
              Pincode: userDetails.Pincode,
              State: userDetails.State
            }
          }
        })
      var data = await db.get().collection(collection.USER_DETAILS).findOne({ userId: userDetails.userId })
      resolve(data)
    })
  },


  //  user profile -->>>


  addProfilePicture: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, { $set: { Profile: true } })
      resolve()
    })
  },

  findUserProfile: (userId) => {
    return new Promise(async (resolve, reject) => {
      var result = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) })
      resolve(result)
    })
  },


  deleteDetails: (DataId) => {
    return new Promise(async (resolve, reject) => {
      console.log('errorerrorerrorerrorerrrorerrorerrrorerrror', DataId)
      let data = await db.get().collection(collection.PAYMENT_DETAILS).removeOne({ _id: ObjectId(DataId) })
      resolve(data)
    })
  },


  deleteUserProfile: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, { $set: { Profile: false } })
      resolve()
    })
  },


  deleteUserProfileDetails: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.USER_DETAILS).removeOne({ _id: ObjectId(userId) })
      resolve()
    })
  },



  // change Password

  changePassword: (data) => {
    return new Promise((resolve, reject) => {
      console.log(data)
      bcrypt.compare(data.checkPassword, data.currentPassword).then((status) => {
        if (status) {
          resolve(status)
        } else {
          resolve(status = false)
        }
      })
    })
  },

  addNewPassword: (data) => {
    return new Promise(async (resolve, reject) => {
      var password = await bcrypt.hash(data.Password, 10)
      db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(data.userId) }, { $set: { Password: password } })
      resolve()
    })

  },

  findCoupon: () => {
    return new Promise(async (resolve, reject) => {
      var coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({ Active: true })
      resolve(coupon)
    })
  },


  userCurrentCoupon: () => {
    return new Promise(async(resolve, reject) => {
      var coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({ Use_coupon: true })
      resolve(coupon)

    })
  },

  deleteCouponUsage: () => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.COUPON_COLLECTION).updateOne({ Use_coupon: true }, { $unset: { Use_coupon: true } })
      resolve()
    })
  },

  compareCouponCode: (data) => {
    return new Promise(async (resolve, reject) => {
      var result = await db.get().collection(collection.COUPON_COLLECTION).findOne({ Active: true })
      var status = null
      if (result) {
        if (result.Coupon_code == data.enteredCode) {
          status = true
        } else {
          status = false
        }
      }
      resolve(status)
    })
  },

  useCoupon:()=>{
    return new Promise(async(resolve,reject)=>{
     await db.get().collection(collection.COUPON_COLLECTION).updateOne({Active:true},{$set:{Use_coupon: true}})
    var coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({Use_coupon: true})
      
      resolve(coupon)
    })
  }



}


