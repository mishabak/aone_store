var db = require('../config/connection')
var collection = require('../config/collection')
var bcrypt = require('bcrypt')
const ObjectId = require('mongodb').ObjectID
const { set } = require('mongoose')
module.exports = {

  // PRODUCT >
  addProduct: (details) => {
    details.Actual_Price = details.Price
    return new Promise(async (resolve, reject) => {
      var product = await db.get().collection(collection.PRODUCT_COLLECTION).insertOne(details)
      var id = product.ops[0]._id
      resolve(id)
    })
  },


  viewProduct: () => {
    return new Promise(async (resolve, reject) => {
      var allProduct = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
      resolve(allProduct)
    })
  },


  editProduct: (productId) => {
    return new Promise(async (resolve, reject) => {
      var editProduct = {}
      editProduct.product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(productId) })
      editProduct.category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
      editProduct.brand = await db.get().collection(collection.BRAND_COLLECTION).find().toArray()
      resolve(editProduct)
    })
  },


  updateProduct: (data) => {
    return new Promise(async (resolve, reject) => {
      var check_data = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(data.Id) })
      if (check_data.Offer) {
        await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(data.Id) }, {
          $set: {
            Name: data.Name,
            Quantity: data.Quantity,
            Price: data.Price,
            Category: data.Category,
            Brand: data.Brand,
            Actual_Price: data.Price
          },
          $unset: {
            Offer: check_data.Offer
          }
        })
      } else {
        await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(data.Id) }, {
          $set: {
            Name: data.Name,
            Quantity: data.Quantity,
            Price: data.Price,
            Category: data.Category,
            Brand: data.Brand,
            Actual_Price: data.Price
          }
        })
      }
      resolve(data.Id)
    })
  },


  deleteProduct: (value) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.PRODUCT_COLLECTION).removeOne({ _id: ObjectId(value) })
      resolve()
    })
  },


  // PRODUCT <


  // CATEGORY >

  viewCategory: () => {
    return new Promise(async (resolve, reject) => {
      var allcollection = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
      resolve(allcollection)
    })
  },


  addCategory: (category) => {
    return new Promise(async (resolve, reject) => {
      category = await db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category)
      var categoryId = category.ops[0]._id
      resolve(categoryId)
    })
  },


  editCategory: (category) => {
    return new Promise(async (resolve, reject) => {
      let editCategory = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: ObjectId(category) })
      resolve(editCategory)
    })
  },


  updateCategory: (value) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: ObjectId(value.Id) }, {
        $set: {
          Category: value.Category
        }
      })
      resolve(value.Id)
    })
  },


  deleteCategory: (value) => {
    return new Promise(async (resolve, reject) => {
      var success = 'success'
      await db.get().collection(collection.CATEGORY_COLLECTION).removeOne({ _id: ObjectId(value) })
      resolve(success)
    })
  },


  // CATEGORY <

  // BRAND >


  viewBrand: () => {
    return new Promise(async (resolve, reject) => {
      var allDocument = await db.get().collection(collection.BRAND_COLLECTION).find().toArray()
      resolve(allDocument)
    })
  },


  addBrand: (brand) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.BRAND_COLLECTION).insertOne(brand)
      resolve()
    })
  },


  editBrand: (brand) => {
    return new Promise(async (resolve, reject) => {
      let editBrand = await db.get().collection(collection.BRAND_COLLECTION).findOne({ _id: ObjectId(brand) })
      resolve(editBrand)
    })
  },


  updateBrand: (value) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.BRAND_COLLECTION).updateOne({ _id: ObjectId(value.Id) }, {
        $set: {
          Brand: value.Brand
        }
      })
      resolve()
    })
  },


  deleteBrand: (value) => {
    return new Promise(async (resolve, reject) => {
      var success = 'success'
      await db.get().collection(collection.BRAND_COLLECTION).removeOne({ _id: ObjectId(value) })
      resolve(success)
    })
  },


  // BRAND <

  // find all orders for order management




  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      var allOrders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
      resolve(allOrders)
    })

  },
  getOrderProducts: (orderId) => {
    return new Promise(async (resolve, reject) => {
      var orderProducts = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            _id: ObjectId(orderId)
          }
        },
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
          }
        },
        {
          $project: {
            quantity: 1,
            product: { $arrayElemAt: ['$product', 0] }
          }
        }
      ]).toArray()
      resolve(orderProducts)

    })

  },

  // update order status

  updateOrderStatus: (order) => {
    return new Promise(async (resolve, reject) => {
      var value = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(order.orderId) }, { $set: { Status: order.status, Background: order.backgroundColor } })
      resolve(value)
    })
  },

  //offer - category and product- to view 

  offerByCategory: () => {
    return new Promise(async (resolve, reject) => {
      let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
      resolve(category)
    })
  },
  offerByProduct: () => {
    return new Promise(async (resolve, reject) => {
      let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
      resolve(product)
    })
  },

  //offer - category and product- to add 


  addOfferByCategory: (data) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: ObjectId(data.categoryId) }, { $set: { Offer: data.Offer } })
      resolve()
    })
  },


  viewOfferByCategory: (data) => {
    return new Promise(async (resolve, reject) => {
      var response = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: ObjectId(data) })
      resolve(response)
    })

  },

  deleteOfferOfCategory: (id) => {
    return new Promise(async (resolve, reject) => {
      var category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: ObjectId(id) })
      await db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: ObjectId(id) }, { $unset: { Offer: category.Offer } })
      resolve()
    })
  },




  // //offer - category and product- to add 


  addOfferByProduct: (data) => {
    return new Promise(async (resolve, reject) => {
      var findProduct = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(data.productId) })
      var OfferPrice = await findProduct.Actual_Price - (findProduct.Actual_Price * data.Offer) / 100
      console.log(OfferPrice);
      await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(data.productId) }, { $set: { Offer: data.Offer, Price: OfferPrice } })
      resolve()
    })
  },


  viewOfferByProduct: (data) => {
    return new Promise(async (resolve, reject) => {
      var response = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(data) })
      resolve(response)
    })

  },

  deleteOfferOfProduct: (id) => {
    return new Promise(async (resolve, reject) => {
      var product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(id) })
      var Prices =product.Actual_Price
      await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(id) }, { $unset: { Offer: product.Offer },$set:{Price:Prices} })
      resolve()
    })
  },

  // for coupon

  addCoupon: (data) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.COUPON_COLLECTION).insertOne(data)
      resolve()
    })
  },


  findCoupen: () => {
    return new Promise(async (resolve, reject) => {
      var coupon = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
      resolve(coupon)
    })
  },

  deleteCoupon: (couponId) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.COUPON_COLLECTION).removeOne({ _id: ObjectId(couponId) })
      resolve()
    })
  },

  activeCoupon: (data) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.COUPON_COLLECTION).updateOne({ _id: ObjectId(data) }, { $set: { Active: true } })
      resolve()
    })
  },

  inactiveCoupon: (data) => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection(collection.COUPON_COLLECTION).updateOne({ _id: ObjectId(data) }, { $unset: { Active: true } })
      resolve()
    })
  },

  cancelOrder: (order) => {
    return new Promise(async (resolve, reject) => {
      var cancelOrder = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(order.orderId) }, { $set: { Status: 'cancelled', Background: order.backgroundColor } })
      resolve(cancelOrder)
    })
  },

  // orders

  findAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      var data = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
      var products = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
      resolve(data)
    })
  },


  // for dashboard
  findPlacedOrders: () => {
    return new Promise(async (resolve, reject) => {
      var data = await db.get().collection(collection.ORDER_COLLECTION).find({ Status: 'placed' }).count()
      resolve(data)
    })
  },
  findProcessedOrders: () => {
    return new Promise(async (resolve, reject) => {
      var data = await db.get().collection(collection.ORDER_COLLECTION).find({ Status: 'processed' }).count()
      resolve(data)
    })
  },
  findShippingOrders: () => {
    return new Promise(async (resolve, reject) => {
      var data = await db.get().collection(collection.ORDER_COLLECTION).find({ Status: 'shipping' }).count()
      resolve(data)
    })
  },
  findDeliveryOrders: () => {
    return new Promise(async (resolve, reject) => {
      var data = await db.get().collection(collection.ORDER_COLLECTION).find({ Status: 'delivery' }).count()
      resolve(data)
    })
  },
  findDeliveredOrders: () => {
    return new Promise(async (resolve, reject) => {
      var data = await db.get().collection(collection.ORDER_COLLECTION).find({ Status: 'delivered' }).count()
      resolve(data)
    })
  },

  findCancelledOrders: () => {
    return new Promise(async (resolve, reject) => {
      var data = await db.get().collection(collection.ORDER_COLLECTION).find({ Status: 'cancelled' }).count()
      resolve(data)
    })

  },

  //find all orders

  findAllOrder:()=>{
    return new Promise(async(resolve,reject)=>{
   var orderCount = await   db.get().collection(collection.ORDER_COLLECTION).find().count()
   resolve(orderCount)
    })
  },

  // find all users

  findAllusers:()=>{
    return new Promise((resolve,reject)=>{
     var allUsers = await = db.get().collection(collection.USER_COLLECTION).find().count()
     resolve(allUsers)
    })
  },


  filterOrdersByDate:(data)=>{
    return new Promise(async(resolve,reject)=>{
     orders = await  db.get().collection(collection.ORDER_COLLECTION).find({Date:{$gte:new Date(data.fromDate+ " 00:00:00.000Z"),$lt:new Date(data.toDate+ " 23:59:00.000Z")}}).toArray()
     resolve(orders)
    })

  },



  findAllProducts:()=>{
    return new Promise((resolve,reject)=>{
    var data =  db.get().collection(collection.PRODUCT_COLLECTION).find().count()
      resolve(data)
    })
  },

  // findTotalAmount:()=>{
  //   return new Promise((resolve,reject)=>{
  //     var totalAmount = db.get().collection(collection.ORDER_COLLECTION).aggregate({
  //       $project:'$TotalAmount'

  //     })
  //   })
  // }

  codPayment:()=>{
    return new Promise(async(resolve,reject)=>{
    var cod = await  db.get().collection(collection.ORDER_COLLECTION).find({PaymentMethod:"COD"}).count()
      resolve(cod)
    })

  },
  razorpayPayment:()=>{
    return new Promise(async(resolve,reject)=>{
      var razorpay = await  db.get().collection(collection.ORDER_COLLECTION).find({PaymentMethod:"Razorpay"}).count()
        resolve(razorpay)
      })
  },
  paypalPayment:()=>{
    return new Promise(async(resolve,reject)=>{
      var paypal = await  db.get().collection(collection.ORDER_COLLECTION).find({PaymentMethod:"Paypal"}).count()
        resolve(paypal)
      })
  }



}