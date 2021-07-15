var express = require('express');
var router = express.Router();
var adminHelper = require('../helpers/admin-login')
var productHelpers = require('../helpers/product-helpers');
const userBlockHelper = require('../helpers/user-block-helper');
const userHelpers = require('../helpers/user-helpers');

/* GET users listing. */

// use  middleWare----

const adminIn = (req, res, next) => {
    var value = req.session.err
    if (req.session.adminLogin) {
        next()
    } else {
        res.render('admin/login', { value, login: true })
        req.session.err = false
    }
}



router.get('/', adminIn, async (req, res) => {
    var placedOrder = await productHelpers.findPlacedOrders()
    var processedOrder = await productHelpers.findProcessedOrders()
    var shippingOrder = await productHelpers.findShippingOrders()
    var deliveryOrder = await productHelpers.findDeliveryOrders()
    var deliveredOrder = await productHelpers.findDeliveredOrders()
    var cancelledOrder = await productHelpers.findCancelledOrders()
    var allOrders = await productHelpers.findAllOrder()
    var allUsers = await productHelpers.findAllusers()
    var allProducts = await productHelpers.findAllProducts()
    var COD = await productHelpers.codPayment()
    var Razorpay = await  productHelpers.razorpayPayment()
    var Paypal = await productHelpers.paypalPayment()
  //  var totalPrice = await productHelpers.findTotalAmount()

    res.render('admin/dashboard', {
        admin: true,
        placedOrder,
        processedOrder,
        shippingOrder,
        deliveryOrder,
        deliveredOrder,
        cancelledOrder,
        allOrders,
        allUsers,
        allProducts,
        COD,Razorpay,
        Paypal
    })
})


router.post('/', (req, res) => {
    adminHelper.adminLogin(req.body).then((response) => {
        if (response.status) {
            req.session.adminLogin = true
            res.redirect('/admin')
        } else {
            req.session.err = true
            res.redirect('/admin')
        }
    })
})



router.get('/logout', (req, res) => {
    req.session.adminLogin = false
    res.redirect('/admin')
})



router.get('/user-details', (req, res) => {
    userBlockHelper.viewAllUserDetails().then((allUsers) => {
        res.render('admin/user-management', { admin: true, allUsers })
    })
})



router.get('/block-user/:id', (req, res) => {
    var userId = req.params.id
    userBlockHelper.blockUser(userId).then(() => {
        res.redirect('/admin/user-details')
    })
})



router.get('/unblock-user/:id', (req, res) => {
    var userId = req.params.id
    userBlockHelper.unBlockUser(userId).then(() => {
        res.redirect('/admin/user-details')
    })
})




router.get('/add-product', adminIn, (req, res) => {
    productHelpers.viewCategory().then((category) => {
        productHelpers.viewBrand().then((brand) => {
            res.render('admin/add-product', { admin: true, category, brand })
        })
    })
})


router.post('/add-product', (req, res) => {
    productHelpers.addProduct(req.body).then((response) => {
        let product_id = response
        let Image1 = req.files.Image1
        let Image2 = req.files.Image2
        let Image3 = req.files.Image3
        let Image4 = req.files.Image4
        Image1.mv('./public/productImage/' + product_id + '1.jpg', (err1, sucess) => { })
        Image2.mv('./public/productImage/' + product_id + '2.jpg', (err2, sucess) => { })
        Image3.mv('./public/productImage/' + product_id + '3.jpg', (err3, sucess) => { })
        Image4.mv('./public/productImage/' + product_id + '4.jpg', (err4, sucess) => { })
        res.redirect('/admin/add-product')
    })
})


router.get('/view-product', adminIn, (req, res) => {
    productHelpers.viewProduct().then((Product) => {
        res.render('admin/view-product', { Product, admin: true })
    })
})


router.get('/edit-product/:id', adminIn, (req, res) => {
    var editProduct = req.params.id
    productHelpers.editProduct(editProduct).then((edit) => {
        product = edit.product
        category = edit.category
        brand = edit.brand
        res.render('admin/edit-product', { category, brand, product, admin: true })
    })
})


router.post('/edit-product', adminIn, (req, res) => {
    productHelpers.updateProduct(req.body).then((id) => {

        if (req.files != null) {
            var image1 = req.files.Image1
            var image2 = req.files.Image2
            var image3 = req.files.Image3
            var image4 = req.files.Image4
        }

        if (image1 && image2 == undefined && image3 == undefined && image4 == undefined) {
            image1.mv('./public/productImage/' + id + '1.jpg', (err, success) => { })
        } else if (image2 && image1 == undefined && image3 == undefined && image4 == undefined) {
            image2.mv('./public/productImage/' + id + '2.jpg', (err, success) => { })
        } else if (image3 && image1 == undefined && image2 == undefined && image4 == undefined) {
            image3.mv('./public/productImage/' + id + '3.jpg', (err, success) => { })
        } else if (image4 && image1 == undefined && image2 == undefined && image3 == undefined) {
            image4.mv('./public/productImage/' + id + '4.jpg', (err, success) => { })
        } else if (image1 && image2 && image3 == undefined && image4 == undefined) {
            image1.mv('./public/productImage/' + id + '1.jpg', (err, success) => { })
            image2.mv('./public/productImage/' + id + '2.jpg', (err, success) => { })
        } else if (image1 && image3 && image2 == undefined && image4 == undefined) {
            image1.mv('./public/productImage/' + id + '1.jpg', (err, success) => { })
            image3.mv('./public/productImage/' + id + '3.jpg', (err, success) => { })
        } else if (image1 && image4 && image2 == undefined && image3 == undefined) {
            image1.mv('./public/productImage/' + id + '1.jpg', (err, success) => { })
            image4.mv('./public/productImage/' + id + '4.jpg', (err, success) => { })
        } else if (image2 && image3 && image1 == undefined && image4 == undefined) {
            image2.mv('./public/productImage/' + id + '2.jpg', (err, success) => { })
            image3.mv('./public/productImage/' + id + '3.jpg', (err, success) => { })
        } else if (image2 && image4 && image1 == undefined && image3 == undefined) {
            image2.mv('./public/productImage/' + id + '2.jpg', (err, success) => { })
            image4.mv('./public/productImage/' + id + '4.jpg', (err, success) => { })
        } else if (image3 && image4 && image1 == undefined && image2 == undefined) {
            image3.mv('./public/productImage/' + id + '3.jpg', (err, success) => { })
            image4.mv('./public/productImage/' + id + '4.jpg', (err, success) => { })
        } else if (image1 && image2 && image3 && image4 == undefined) {
            image1.mv('./public/productImage/' + id + '1.jpg', (err, success) => { })
            image2.mv('./public/productImage/' + id + '2.jpg', (err, success) => { })
            image3.mv('./public/productImage/' + id + '3.jpg', (err, success) => { })
        } else if (image1 && image3 && image4 && image2 == undefined) {
            image1.mv('./public/productImage/' + id + '1.jpg', (err, success) => { })
            image3.mv('./public/productImage/' + id + '3.jpg', (err, success) => { })
            image4.mv('./public/productImage/' + id + '4.jpg', (err, success) => { })
        } else if (image1 && image2 && image4 && image3 == undefined) {
            image1.mv('./public/productImage/' + id + '1.jpg', (err, success) => { })
            image2.mv('./public/productImage/' + id + '2.jpg', (err, success) => { })
            image4.mv('./public/productImage/' + id + '4.jpg', (err, success) => { })
        } else if (image2 && image3 && image4 && image1 == undefined) {
            image2.mv('./public/productImage/' + id + '2.jpg', (err, success) => { })
            image3.mv('./public/productImage/' + id + '3.jpg', (err, success) => { })
            image4.mv('./public/productImage/' + id + '4.jpg', (err, success) => { })
        } else if (image1 && image2 && image3 && image4) {
            image1.mv('./public/productImage/' + id + '1.jpg', (err, success) => { })
            image2.mv('./public/productImage/' + id + '2.jpg', (err, success) => { })
            image3.mv('./public/productImage/' + id + '3.jpg', (err, success) => { })
            image4.mv('./public/productImage/' + id + '4.jpg', (err, success) => { })
        }
        res.redirect('/admin/view-product')
    })
})


router.get('/delete-product/:id', adminIn, (req, res) => {
    var productId = req.params.id
    productHelpers.deleteProduct(productId).then(() => {
        res.redirect('/admin/view-product')
    })
})


//---->----CATEGORY------>------>


router.get('/add-category', adminIn, (req, res) => {
    res.render('admin/add-category', { admin: true })
})


router.post('/add-category', (req, res) => {
    productHelpers.addCategory(req.body).then((response) => {
        let category_id = response
        let image = req.files.Image
        image.mv('./public/categoryImage/' + category_id + '.jpg', (err, success) => {
            console.log(err);
        })
        res.redirect('/admin/add-category')
    })
})


router.get('/view-category', adminIn, (req, res) => {
    productHelpers.viewCategory().then((response) => {
        res.render('admin/view-category', { response, admin: true })
    })
})


router.get('/edit-category/:id', adminIn, (req, res) => {
    var categoryId = req.params.id
    productHelpers.editCategory(categoryId).then((response) => {
        res.render('admin/edit-category', { response, admin: true })
    })
})


router.post('/edit-category', (req, res) => {
    productHelpers.updateCategory(req.body).then((id) => {
        var editImage = req.files.Image
        editImage.mv('./public/categoryImage/' + id + '.jpg', (err, success) => {
        })
        res.redirect('/admin/view-category')
    })
})


router.get('/delete-category/:id', adminIn, (req, res) => {

    var deleteId = req.params.id
    console.log(deleteId);
    productHelpers.deleteCategory(deleteId).then(() => {
        res.redirect('/admin/view-category')
    })
})


//----<----CATEGORY------<------<

//---->----BRAND------>------>


router.get('/view-brand', adminIn, (req, res) => {
    productHelpers.viewBrand().then((response) => {
        res.render('admin/view-brand', { response, admin: true })
    })
})


router.get('/add-brand', adminIn, (req, res) => {
    res.render('admin/add-brand', { admin: true })
})


router.post('/add-brand', (req, res) => {
    productHelpers.addBrand(req.body).then(() => {
        res.redirect('/admin/add-brand')
    })
})


router.get('/edit-brand/:id', adminIn, (req, res) => {
    var brandId = req.params.id
    productHelpers.editBrand(brandId).then((response) => {
        res.render('admin/edit-Brand', { response, admin: true })
    })
})


router.post('/edit-brand', (req, res) => {
    productHelpers.updateBrand(req.body).then(() => {
        res.redirect('/admin/view-brand')
    })
})


router.get('/delete-Brand/:id', adminIn, (req, res) => {
    var deleteId = req.params.id
    productHelpers.deleteBrand(deleteId).then(() => {
        res.redirect('/admin/view-brand')
    })
})


//----<----BRAND------<------<

//---->----ORDER------>------>


router.get('/view-order', async (req, res) => {
    var allOrders = await productHelpers.getAllOrders()
    res.render('admin/order-management', { admin: true, allOrders })
})


router.get('/view-order-products/:id', async (req, res) => {
    var allProducts = await productHelpers.getOrderProducts(req.params.id)
    res.render('admin/view-order-products', { admin: true, allProducts })
})


//----<----ORDER------<------<

// change status
router.post('/change-status', async (req, res) => {
    var value = await productHelpers.updateOrderStatus(req.body)
    console.log("updated status", value);
    res.json(value)


})


router.get('/view-offer', async (req, res) => {
    var category = await productHelpers.offerByCategory()
    var product = await productHelpers.offerByProduct()
    var coupon = await productHelpers.findCoupen()
    res.render('admin/view-offer', { admin: true, category, product, coupon })
})

// add offer by category -->>
router.post('/add-category-offer', async (req, res) => {
    await productHelpers.addOfferByCategory(req.body)
    res.json({ status: true })
})

router.post('/view-category-offer', async (req, res) => {
    var category = await productHelpers.viewOfferByCategory(req.body.categoryId)
    res.json(category)
})

router.post('/delete-category-offer', async (req, res) => {
    await productHelpers.deleteOfferOfCategory(req.body.categoryId)
    res.json({ response: true })
})



// add offer>>
router.post('/add-product-offer', async (req, res) => {
    await productHelpers.addOfferByProduct(req.body)
    res.json({ status: true })
})

router.post('/view-product-offer', async (req, res) => {
    var product = await productHelpers.viewOfferByProduct(req.body.productId)
    res.json(product)
})

router.post('/delete-product-offer', async (req, res) => {
    await productHelpers.deleteOfferOfProduct(req.body.productId)
    res.json({ response: true })
})


// add coupen
router.post('/add-coupon', async (req, res) => {
    await productHelpers.addCoupon(req.body)
    res.json({ response: true })
})

router.post('/delete-coupon', async (req, res) => {
    await productHelpers.deleteCoupon(req.body.couponId)
    res.json({ response: true })
})

router.post('/active-coupon', async (req, res) => {
    await productHelpers.activeCoupon(req.body.couponId)
    res.json({ response: true })
})

router.post('/inactive-coupon', async (req, res) => {
    await productHelpers.inactiveCoupon(req.body.couponId)
    res.json({ response: 'msb' })
})
// order cancel

router.post('/cancel-order', async (req, res) => {
    var cancelOrder = await productHelpers.cancelOrder(req.body)
    res.json({ cancel: true })
})


// report module


router.get('/view-report', async (req, res) => {
    var orders = await productHelpers.findAllOrders()
    res.render('admin/view-report', { admin: true, orders })

})


// filter order data 

router.post('/view-report',async(req,res)=>{
    var orders = await productHelpers.filterOrdersByDate(req.body)
    res.render('admin/view-filterOrders',{orders , admin:true})
})



module.exports = router;
