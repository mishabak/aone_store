


function categoryModal(userId) {
    document.getElementById('categoryModal').style.display = 'block'
    document.getElementById('userId').value = userId
    var hide = document.getElementById('categoryModal')
    var span = document.getElementById('span')
    window.onclick = (event) => {
        if (event.target == hide) {
            document.getElementById('categoryModal').style.display = 'none'
        } else if (event.target == span) {
            document.getElementById('categoryModal').style.display = 'none'
        }
    }
}
// view modal for edit
function categoryModalEdit(categoryId) {
    document.getElementById('userId-1').value = categoryId
    $.ajax({
        url: '/admin/view-category-offer',
        data: { categoryId },
        method: 'post',
        success: (response) => {
            document.getElementById('categoryOffer-1').value = response.Offer
            document.getElementById('categoryModal-1').style.display = 'block'
            document.getElementById('edit-btn-1').style.display = 'block'
            document.getElementById('delete-btn-1').style.display = 'block'
            var hide = document.getElementById('categoryModal-1')
            var span = document.getElementById('span-1')
            window.onclick = (event) => {
                if (event.target == hide) {
                    document.getElementById('categoryModal-1').style.display = 'none'
                } else if (event.target == span) {
                    document.getElementById('categoryModal-1').style.display = 'none'
                }
            }
        }
    })
}

function editOfferToCategory() {
    var categoryOffer = $('#categoryOffer-1').val()
    if (categoryOffer < 1 || categoryOffer > 100) {
        document.getElementById('errorMsg-1').style.display = 'block'
    } else {
        document.getElementById('errorMsg-1').style.display = 'none'
        $.ajax({
            url: '/admin/add-category-offer',
            method: 'post',
            data: $('#category-offer-1').serialize(),
            success: (response) => {
                if (response) {
                    document.getElementById('categoryModal-1').style.display = 'none'
                    location.reload()
                }
            }
        })
    }
}
function categoryOfferDelete() {
    var deletes = confirm('Are you sure')
    if (deletes) {
        var categoryId = document.getElementById('userId-1').value
        $.ajax({
            url: '/admin/delete-category-offer',
            data: { categoryId },
            method: 'post',
            success: (response) => {
                if (response) {
                    document.getElementById('categoryModal-1').style.display = 'none'
                    location.reload()
                }
            }
        })
    }else{
        document.getElementById('categoryModal-1').style.display = 'none' 
    }

}

function addOfferToCategory() {
    var categoryOffer = $('#categoryOffer').val()
    if (categoryOffer < 1 || categoryOffer > 100) {
        document.getElementById('errorMsg').style.display = 'block'
    } else {
        document.getElementById('errorMsg').style.display = 'none'
        $.ajax({
            url: '/admin/add-category-offer',
            method: 'post',
            data: $('#category-offer').serialize(),
            success: (response) => {
                if (response) {
                    document.getElementById('categoryModal').style.display = 'none'
                    location.reload()
                }
            }
        })
    }
}
// product modal

function productModal(userId) {
    document.getElementById('userId-2').value = userId
    document.getElementById('productModal').style.display = 'block'
    var hide1 = document.getElementById('productModal')
    var span1 = document.getElementById('span-2')
    window.onclick = (event) => {
        if (event.target == hide1) {
            document.getElementById('productModal').style.display = 'none'
        } else if (event.target == span1) {
            document.getElementById('productModal').style.display = 'none'
        }
    }
}


function productModalEdit(productId) {
    document.getElementById('userId-3').value = productId
    $.ajax({
        url: '/admin/view-product-offer',
        data: { productId },
        method: 'post',
        success: (response) => {
            document.getElementById('productOffer-1').value = response.Offer
            document.getElementById('productModal-1').style.display = 'block'
            document.getElementById('edit-btn-2').style.display = 'block'
            document.getElementById('delete-btn-2').style.display = 'block'
            var hide = document.getElementById('productModal-1')
            var span = document.getElementById('span-3')
            window.onclick = (event) => {
                if (event.target == hide) {
                    document.getElementById('productModal-1').style.display = 'none'
                } else if (event.target == span) {
                    document.getElementById('productModal-1').style.display = 'none'
                }
            }
        }
    })
}


function editOfferToProduct() {
    var categoryOffer = $('#productOffer-1').val()
    if (categoryOffer < 1 || categoryOffer > 100) {
        document.getElementById('errorMsg-3').style.display = 'block'
    } else {
        document.getElementById('errorMsg-3').style.display = 'none'
        $.ajax({
            url: '/admin/add-product-offer',
            method: 'post',
            data: $('#product-offer-1').serialize(),
            success: (response) => {
                if (response) {
                    document.getElementById('productModal-1').style.display = 'none'
                    location.reload()
                }
            }
        })
    }
}

function productOfferDelete() {
    var deletes = confirm('Are you sure')
    if (deletes) {
        var productId = document.getElementById('userId-3').value
        $.ajax({
            url: '/admin/delete-product-offer',
            data: { productId },
            method: 'post',
            success: (response) => {
                if (response) {
                    document.getElementById('productModal-1').style.display = 'none'
                    location.reload()
                }
            }
        })
    } else {
        document.getElementById('productModal-1').style.display = 'none'
    }

}



function addOfferToProduct() {
    var productOffer = $('#productOffer').val()
    if (productOffer < 1 || productOffer > 100) {
        document.getElementById('errorMsg-2').style.display = 'block'
    } else {
        document.getElementById('errorMsg-2').style.display = 'none'
        $.ajax({
            url: '/admin/add-product-offer',
            method: 'post',
            data: $('#product-offer').serialize(),
            success: (response) => {
                if (response) {
                    document.getElementById('productModal').style.display = 'none'
                    location.reload()
                }
            }
        })
    }
}