var express = require('express');
var router = express.Router();
var userHelpers = require('../helpers/user-helpers')
var otpHelpers = require('../helpers/otp-helpers')
var productHelpers = require('../helpers/product-helpers');
const { json } = require('express');

// check user login or not by the  middleWare ---->>
var verifyUserLogin = (req, res, next) => {


  if (req.session.user) {
    next()
  } else {
    res.redirect('/login')
  }
}

// check user blocked by a middle ware ---->>
const userBlocked = async (req, res, next) => {
  if (req.session.user) {
    var response = await userHelpers.userDetails(req.session.user._id)
    if (response.Block) {
      req.session.user = null
      res.redirect('/login')
    } else {
      next()
    }
  } else {
    next()
  }
}

// find cart count and user profile  ---->> 
const profileAndCartCount = async (user, profile) => {
  var cartCount = null
  var allValues = {}
  if (user) {
    cartCount = await userHelpers.getCartCount(user._id)
    allValues.cartCount = cartCount
    if (user.Profile || profile) {
      allValues.Profile = true
    }
  }
  return allValues;
}

// let cartCount = null
//   if (req.session.user) {
//     cartCount = await userHelpers.getCartCount(req.session.user._id)
//     if (req.session.user.Profile || req.session.Profile) {
//       var Profile = true
//     }
//   }

router.get('/', async (req, res) => {
  var allValues = await profileAndCartCount(req.session.user, req.session.Profile)
  var responses = await userHelpers.viewRandomProduct()
  var response = await userHelpers.viewRandomProduct()
  var category = await userHelpers.viewCategory()
  req.session.category = category
  res.render('user/view-homepage', {
    'cartCount': allValues.cartCount,
    'userName': req.session.user,
    'Profile': allValues.Profile,
    user: true,
    responses,
    category,
    response
  })
});


router.get('/single-view/:id', async (req, res) => {
  var allValues = await profileAndCartCount(req.session.user, req.session.Profile)
  var response = await userHelpers.singleViewProducts(req.params.id)
  var result = await userHelpers.productRelatedCategory(response.Category)
  var category = await userHelpers.viewCategory()
  res.render('user/single', {
    'productCategory': response.Category,
    'cartCount': allValues.cartCount,
    'Profile': allValues.Profile,
    'userName': req.session.user,
    'productDetails': response,
    'relatedProducts': result,
    single: true,
    user: true,
    category
  })
});


router.get('/category/:id', async (req, res) => {
  var allValues = await profileAndCartCount(req.session.user, req.session.Profile)
  var products = await userHelpers.productByCategory(req.params.id)
  var category = await userHelpers.viewCategory()
  res.render('user/category', {
    'cartCount': allValues.cartCount,
    'currentCategory': req.params.id,
    'Profile': allValues.Profile,
    'userName': req.session.user,
    user: true,
    products,
    category
  })
});


router.get('/sign-up', async (req, res) => {
  var category = await userHelpers.viewCategory()
  res.render('user/user-signup', {
    'checkEmail': req.session.userEmail,
    'checkPhone': req.session.userPhone,
    'checkName': req.session.userName,
    signUp: true,
    user: true,
    category,
  })
  req.session.userPhone = false
  req.session.userEmail = false
  req.session.userName = false
});


router.post('/sign-up', (req, res) => {
  userHelpers.validateUserDetails(req.body).then(async () => {
    req.session.user = await userHelpers.userSignUp(req.body)
    res.redirect('/')
  }).catch((data) => {
    req.session.userName = data.userName
    req.session.userEmail = data.userEmail
    req.session.userPhone = data.userPhone
    res.redirect('sign-up')
  })
})


router.get('/login', async (req, res) => {
  var category = await userHelpers.viewCategory()
  res.render('user/login', {
    'loginError': req.session.loginError,
    'otpError': req.session.otpError,
    "blocked": req.session.blocked,
    userslogin: true,
    user: true,
    category
  })
  req.session.loginError = false
  req.session.otpError = false
  req.session.blocked = false
})


router.post('/login', async (req, res) => {
  var response = await userHelpers.userLogin(req.body)
  if (response.status) {
    if (!response.user.Block) {
      req.session.user = response.user
      res.redirect('/')
    } else {
      req.session.blocked = response.user.Block
      res.redirect('/login')
    }
  } else {
    req.session.loginError = true
    res.redirect('/login')
  }
})


router.post('/login-otp', async (req, res) => {
  if (req.body.Phone) {
    var response = await otpHelpers.otpVerification(req.body.Phone)
    if (response) {
      req.session.phoneNumber = response.Phone
      await otpHelpers.sendMessage(response.Phone)
      res.render('user/otp', { user: true, userslogin: true })
    } else {
      req.session.loginError = true
      res.redirect('/login')
    }
  } else {
    res.redirect('/login')
  }
})


router.post('/verify-otp', async (req, res) => {
  var result = {}
  result.otp =
    req.body.num1 +
    req.body.num2 +
    req.body.num3 +
    req.body.num4 +
    req.body.num5 +
    req.body.num6
  result.phone = req.session.phoneNumber
  var response = await otpHelpers.compareOtp(result)
  if (response.status == 'approved') {
    var data = await otpHelpers.findUserByOtp(result.phone)
    req.session.user = data
    res.redirect('/')
  } else {
    req.session.phoneNumber = null
    req.session.otpError = true
    res.redirect('/login')
  }
})


router.get('/log-out', (req, res) => {
  req.session.user = null
  res.redirect('/')
})


// cart section --->>
router.get('/view-cart', verifyUserLogin, userBlocked, async (req, res) => {
  var allValues = await profileAndCartCount(req.session.user, req.session.Profile)
  let products = await userHelpers.getCartProducts(req.session.user._id)
  let totalValue = await userHelpers.getTotalAmount(req.session.user._id)
  let cartEmpty
  if (totalValue == 'cartEmpty') {
    cartEmpty = true
  }
  res.render('user/view-cart', {
    'cartCount': allValues.cartCount,
    'category': req.session.category,
    'Profile': allValues.Profile,
    'userName': req.session.user,
    'users': req.session.user,
    cartTrue: true,
    viewcart: true,
    totalValue,
    cartEmpty,
    user: true,
    products,
  })
})


router.get('/add-to-cart/:id', async (req, res) => {
  console.log(req.session.user);
  if (req.session.user) {
    await userHelpers.addToCart(req.params.id, req.session.user._id)
    res.json({ status: true })
  } else {
    res.json({ status: false })
  }

})


router.post('/change-product-quantity', async (req, res) => {
  var response = await userHelpers.changeProductQuantity(req.body)
  response.totalValue = await userHelpers.getTotalAmount(req.body.user)
  res.json(response)
})


router.post('/cart-product-delete', async (req, res) => {
  var response = await userHelpers.deleteCartProduct(req.body)
  res.json(response)
})


// checkout --->>


router.get('/checkout', verifyUserLogin, async (req, res) => {
  var allValues = await profileAndCartCount(req.session.user, req.session.Profile)
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  let user_details = await userHelpers.findUserDetails(req.session.user._id)           // user details from profile
  let payment_details = await userHelpers.findPaymentDetails(req.session.user._id)  // saved data for next time
  var coupons = await userHelpers.findCoupon()
  var coupon = null
  if (coupons) {
    coupon = true
  } else {
    coupon = false
  }
  var detailsStatus = null
  if (user_details.length > 0 || payment_details.length > 0) {
    detailsStatus = true
  } else {
    detailsStatus = false
  }
  res.render('user/checkout', {
    'cartCount': allValues.cartCount,
    'userData': req.session.user._id,
    'category': req.session.category,
    'Profile': allValues.Profile,
    'userName': req.session.user,
    'userDetails': user_details,
    'paymentDetails': payment_details,
    detailsStatus,
    user: true,
    total,
    coupon,
    coupons
  })
})

router.post('/validate-coupone-code', async (req, res) => {
  var response = await userHelpers.compareCouponCode(req.body)
  res.json(response)

})

router.get('/verify-coupon-code', async (req, res) => {
  var response = {}
  response.data = await userHelpers.useCoupon()
  response.status = true
  res.json(response)
})


router.post('/checkout', verifyUserLogin, async (req, res) => {
  let products = await userHelpers.getCartProductList(req.body.userId)
  let Price = await userHelpers.getTotalAmountOfProduct(req.body.userId)
  let coupon = await userHelpers.userCurrentCoupon()
  let totalPrice = null
  if (coupon) {
    var value =  Price - (Price * coupon.Coupon_percentage) / 100
    totalPrice =  parseInt(value)
  } else {
    totalPrice = Price
  }
  userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
    if (req.body['Payment-method'] === 'COD') {
      res.json({ cod_success: true })
    } else if (req.body['Payment-method'] === 'Razorpay') {
      userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
        res.json(response)
      })
    } else if (req.body['Payment-method'] === 'Paypal') {
      let values = {}
      values.total = totalPrice
      values.method = 'Paypal'
      res.json(values)
    }
    // save details for next time
    if (req.body.SaveAddress) {
      userHelpers.saveUserDetails(req.body)
      console.log(req.body);
    }
  })

})


router.get('/order-success', async (req, res) => {
  var allValues = await profileAndCartCount(req.session.user, req.session.Profile)
  await userHelpers.deleteCouponUsage()
  res.render('user/order-success', {
    'category': req.session.category,
    'Profile': allValues.Profile,
    'userName': req.session.user,
    user: true
  })
})


router.get('/View-order', verifyUserLogin, async (req, res) => {
  var allValues = await profileAndCartCount(req.session.user, req.session.Profile)
  let orders = await userHelpers.getUserOrders(req.session.user._id)
  for (var i = 0; i < orders.length; i++) {
    if (orders[i].Status == 'placed' || orders[i].Status == 'processed') {
      orders[i].cancel = true
    } else {
      orders[i].cancel = false
    }
  }
  res.render('user/View-order', {
    'cartCount': allValues.cartCount,
    'category': req.session.category,
    'Profile': allValues.Profile,
    'userName': req.session.user,
    user: true,
    orders,
  })
})


router.post('/cancel-order', async (req, res) => {
  var cancelOrder = await userHelpers.cancelOrder(req.body)
  res.json({ cancel: true })
})


router.get('/view-order-products/:id', async (req, res) => {
  var allValues = await profileAndCartCount(req.session.user, req.session.Profile)
  var products = await userHelpers.getOrderProducts(req.params.id)
  res.render('user/view-order-products', {
    'cartCount': allValues.cartCount,
    'Profile': allValues.Profile,
    'userName': req.session.user,
    user: true,
    products,
  })
})


router.post('/verify-payment', (req, res) => {
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
      res.json({ status: true })
    })
  }).catch((err) => {
    res.json({ status: false, errMsg: '' })
  })
})


// user Profile --->>>


router.get('/user-profile', verifyUserLogin, async (req, res) => {
  var allValues = await profileAndCartCount(req.session.user, req.session.Profile)
  var response = await userHelpers.findUserDetails(req.session.user._id)
  if (response[0]) {
    var userDetails = true
    var details = response[0]
  } else {
    userDetails = false
  }
  var userProfile = await userHelpers.findUserProfile(req.session.user._id)
  req.session.Profile = userProfile.Profile
  res.render('user/userProfile', {
    'cartCount': allValues.cartCount,
    'category': req.session.category,
    'Profile': req.session.Profile,
    'userId': req.session.user._id,
    'userName': req.session.user,
    userDetails,
    user: true,
    details,
  })
});


router.post('/add-details', verifyUserLogin, async (req, res) => {
  let details = {}
  details.details_1 = req.body
  details.userId = req.session.user._id
  await userHelpers.addUserDetails(details)
  setTimeout(() => {
    res.redirect('/user-profile')
  }, 400)
})


router.post('/edit-profile', async (req, res) => {
  var response = await userHelpers.editUserDetails(req.body)
  console.log("success", response)
  res.json(response)
})


//edit user profile
router.post('/edit-image', async (req, res) => {
  var profile = req.files.Profile
  await profile.mv('./public/user-profiles/' + req.body.userId + '.jpg')
  await userHelpers.addProfilePicture(req.body.userId)
  res.json({ editImage: true })
})


router.post('/deletePaymentDetails', async (req, res) => {
  console.log(req.body.Id);
  await userHelpers.deleteDetails(req.body.Id)
  res.json({ response: true })
})


router.post('/delete-profile-image', async (req, res) => {
  await userHelpers.deleteUserProfile(req.body.userId)
  res.json({ response: true })

})

router.post('/delete-user-profile-details', async (req, res) => {
  await userHelpers.deleteUserProfileDetails(req.body.userId)
  res.json({ response: true })

})

// change password
router.post('/check-password', async (req, res) => {
  var data = {}
  data.checkPassword = req.body.value
  data.currentPassword = req.session.user.Password
  var status = await userHelpers.changePassword(data)
  res.json(status)
})
router.post('/save-new-password', async (req, res) => {
  data = {}
  data.userId = req.session.user._id
  data.Password = req.body.newPassword
  await userHelpers.addNewPassword(data)
  res.json({ status: true })
})




module.exports = router;
