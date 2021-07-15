
$(document).ready(function () {
  $("#user-signup").validate({
    rules: {
      Name: {
        required: true,
        minlength: 4,
      },
      Email: {
        required: true,
        email: true,
      },
      Phone: {
        required: true,
        minlength: 10,
        maxlength: 10
      },
      Password: {
        required: true,
        minlength: 8,
      }
    },
    messages: {
      Name: {
        required: "Enter Your Name"
      },
      Email: {
        required: "Enter Your Email"
      },
      Number: {
        required: "Enter Your Number"
      },
      Password: {
        required: "Enter your Password"
      }
    }
  }),

    //  for user login
    $("#user-login").validate({
      rules: {
        Phone: {
          required: true,
          minlength: 10,
          maxlength: 10,
        },
        Password: {
          required: true,
          minlength: 8,
        },
      },
      messages: {
        Phone: {
          required: "Enter Your Number"
        },
        Password: {
          required: "Enter Your Password"
        }
      }
    })

  $('#addProductForm').validate({
    rules: {
      Name: {
        required: true,
        maxlength: 13,
        minlength: 3
      },
      Quantity: {
        required: true
      },
      Price: {
        required: true
      },
      Image1: {

        required: true
      },
      Image2: {
        required: true
      },
      Image3: {
        required: true
      },
      Image4: {
        required: true
      }
    },
    messages: {
      Name: {
        required: "Please enter the product name"
      },
      Quantity: {
        required: "Please enter the quantity"
      },
      Price: {
        required: "please enter the price"
      },
      Image1: {
        required: "Image 1 is required"
      },
      Image2: {
        required: "Image 2 is required"
      },
      Image3: {
        required: "Image 3 is required"
      },
      Image4: {
        required: "Image 4 is required"
      }
    }

  })

  $('#checkout-forms').validate({
      rules: {
        Name: {
          required: true,
          minlength:4,
          lettersonly: true 

        },
        Email: {
          required: true,
          email:true

        },
        Address: {
          required: true,
          minlength:4

        },
        Phone: {
          required: true,
          minlength:10,
          maxlength:10

        },
        city: {
          required: true,
          minlength:3

        },
        Pincode: {
          required: true

        },
        State: {
          required: true

        },
        'Payment-method': {
          required: true

        }
      },
      messages:{
        Name: {
          required: 'Please enter your name'

        },
        Email: {
          required: 'Please enter your email'

        },
        Address: {
          required: 'Please enter your address'

        },
        Phone: {
          required: 'Please enter your mobile number'

        },
        city: {
          required: 'Please enter your city'

        },
        Pincode: {
          required: 'Please enter your pincode'

        },
        State: {
          required: 'Please choose your state'

        },
        'Payment-method': {
          required: 'Please choose your payment method'

        }

      },
      submitHandler: function(form) {
        validationSuccess()
      }
    })


    $('#profile-form').validate({

      rules: {
        Name: {
          required: true,
          minlength:4,
          lettersonly: true 

        },
        Email: {
          required: true,
          email:true

        },
        Address: {
          required: true,
          minlength:4

        },
        Phone: {
          required: true,
          minlength:10,
          maxlength:10

        },
        city: {
          required: true,
          minlength:3

        },
        Pincode: {
          required: true

        },
        State: {
          required: true

        }
      },
      messages:{
        Name: {
          required: 'Please enter your name'

        },
        Email: {
          required: 'Please enter your email'

        },
        Address: {
          required: 'Please enter your address'

        },
        Phone: {
          required: 'Please enter your mobile number'

        },
        City: {
          required: 'Please enter your city'

        },
        Pincode: {
          required: 'Please enter your pincode'

        },
        State: {
          required: 'Please choose your state'

        }

      }
    })

    $('#category-offer').validate({
      rules:{
        Offer:{
          required:true,
          minlength:1,
          maxlength:3
        }
      },
      messages:{
        Offer:{
          required:"Please enter offer",
        }
      },
      submitHandler:(form)=>{
        addOfferToCategory()

      }
    })

    $('#category-offer-1').validate({
      rules:{
        Offer:{
          required:true,
          minlength:1,
          maxlength:3
        }
      },
      messages:{
        Offer:{
          required:"Please enter offer",
        }
      },
      submitHandler:(form)=>{
        editOfferToCategory()

      }
    })



    $('#product-offer').validate({
      rules:{
        Offer:{
          required:true,
          minlength:1,
          maxlength:3
        }
      },
      messages:{
        Offer:{
          required:"Please enter offer",
        }
      },
      submitHandler:(form)=>{
        addOfferToProduct()

      }
    })

    $('#product-offer-1').validate({
      rules:{
        Offer:{
          required:true,
          minlength:1,
          maxlength:3
        }
      },
      messages:{
        Offer:{
          required:"Please enter offer",
        }
      },
      submitHandler:(form)=>{
        editOfferToProduct()

      }
    })


    $('#coupon').validate({
      rules:{
        Coupon_code:{
          required:true,
          minlength:5,
          maxlength:8
        },
        Coupon_percentage:{
          required:true,
          minlength:1,
          maxlength:3
        }
      },
      messages:{
        Coupon_code:{
          required:'Enter coupon code'
        },
        Coupon_percentage:{
          required:'Enter Percentage'
        }

      },
      submitHandler:(form)=>{
        addCoupon()
      }
    })


    $('#change-password').validate({
      rules:{
        Password:{
          required:true,
          minlength:8
        }
      },
      messages:{
        Password:{
          required:'enter at least 8 characters'
        }

      },
      submitHandler:(form)=>{
        checkPassword()

      }
    })
  
    $('#new-password').validate({
      rules:{
        Password:{
          required:true,
          minlength:8
        }
      },
      messages:{
        Password:{
          required:'enter at least 8 characters'
        }

      },
      submitHandler:(form)=>{
        saveNewPassword()

      }
    })

    $('#use-coupon').validate({
      rules:{
        Coupon_code:{
          required:true,
          minlength:5,
          maxlength:8
        }
      },
      messages:{
        Coupon_code:{
          required:'Enter your coupon code'
        }
      }
    })
    


})