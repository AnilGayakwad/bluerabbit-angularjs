app.controller('mainController', function($scope, $location, $rootScope, $window, $http, Auth, $routeParams, $timeout, $cookies, $cookieStore, ngToast ){
  'use strict';
  $scope.showTab = "Recommended";
  $(document).ready(function() {
    $('.products-tab').hide();
    $('.products-tab').first().show();
    $('#tabs-menu a').first().addClass('active');

    $('#tabs-menu a').click(function(e) {
      $('.products-tab').hide();
      $('#tabs-menu a').removeClass('active');

      $(this).addClass('active');
      e.preventDefault();
      var thisTab = $(this).attr('href');
      $(thisTab).show();
    });
  });

  $('.header-menu__list').find('a').click(function(){
    var $href = $(this).attr('href');
    var $anchor = $($href).offset();
    window.scrollTo($anchor.left,$anchor.top  - 100);
    return false;
  });

  $(document).ready(function(){
  	$('.search-icon').click(function() {
  		$('.search-box').show();
      $('.close-icon').show();
  	});
  	$('.close-icon').click(function() {
  		$('.search-box').hide();
      $('.close-icon').hide();
  	});
  });



  //section slider
  $scope.myInterval = 8000;
  $scope.noWrapSlides = false;

//   var slideIndex = 0;
// $scope.showSlides = function() {
//     var i;
//     var slides = document.getElementsByClassName("mySlides");
//     var dots = document.getElementsByClassName("dot");
//     for (i = 0; i < slides.length; i++) {
//        slides[i].style.display = "none";
//     }
//     slideIndex++;
//     if (slideIndex> slides.length) {slideIndex = 1}
//     // for (i = 0; i < dots.length; i++) {
//     //   //  dots[i].className = dots[i].className.replace(" active", "");
//     // }
//     slides[slideIndex-1].style.display = "block";
//     //$(slides[slideIndex-1]).css("display","block");
//     //dots[slideIndex-1].className += " active";
//     setTimeout($scope.showSlides, 6000); // Change image every 2 seconds
// }

  //create session id

    $scope.createUUID = function() {
      var s = [];
      var hexDigits = "0123456789abcdef";
      for (var i = 0; i < 36; i++) {
          s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
      }
      s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
      s[8] = s[13] = s[18] = s[23] = "-";

      var uuid = s.join("");
      console.log("uuid",uuid);
      //cookie store
      //cookieStore
       $cookieStore.put("sessionId", uuid);
      return uuid;
    }

    if ($cookieStore.get('sessionId')) {
      //$scope.createUUID();
      console.log("cookie will not store sessionId as there is  session id");
    } else {
      console.log("cookie will  store sessionId ");
      $scope.createUUID();
    }

    console.log("cookie",$cookieStore.get('sessionId'));

  //slider

  $('#prv-testimonial').on('click', function(){
    var $last = $('#testimonial-list .slide-list:last');
    $last.remove().css({ 'margin-left': '-400px' });
    $('#testimonial-list .slide-list:first').before($last);
    $last.animate({ 'margin-left': '0px' }, 1000);
});

$('#nxt-testimonial').on('click', function(){
    var $first = $('#testimonial-list .slide-list:first');
    $first.animate({ 'margin-left': '-400px' }, 1000, function() {
        $first.remove().css({ 'margin-left': '0px' });
        $('#testimonial-list .slide-list:last').after($first);
    });
});

  //redirection
  $(".search-box").keypress(function (e) {
      var code = e.keyCode ? e.keyCode : e.which;
      if (code.toString() == 13) {
         nextpage(); // call the function to redirect to another page
          return false;
      }
    });

  // Function that redirect the user to another page
  function nextpage() {
    window.location = "#/search-page";
  }


  //scrooling page,showing header fixed

  var elementPosition = $('#scroll-menu-fixed').offset().top;

  $(window).scroll(function(){
    if($(window).scrollTop() > elementPosition){
          $('#scroll-menu-fixed').css('position','fixed').css({"top":"0","right":"0","left":"0"});
    } else {
        $('#scroll-menu-fixed').css('position','static');
    }
  });
  var elementPosition = $('#scroll-menu-fixed1').offset().top;

  $(window).scroll(function(){
    if($(window).scrollTop() > elementPosition){
          $('#scroll-menu-fixed1').css('position','fixed').css({"top":"97px","right":"0","left":"0"});
    } else {
        $('#scroll-menu-fixed1').css('position','static');
    }
  });

  //get all products in landing page
  $scope.product = function() {
    $scope.productslist = [];
    Auth.products().success(function(data) {
    console.log('data',data);
    $scope.allProducts = data;
     angular.forEach($scope.allProducts, function (value, key) {
       var obj = {
         "id" : value._id,
         "name" : value.name,
         "description" : value.description,
         "price" : value.salePrice,
         "imag_url" : value.mainImageUrl
       };
       $scope.productslist.push(obj);
       console.log("product id", $scope.productslist);
     });
       $scope.getCategoriesList ();
    }).error(function(data) {
      console.log('data', data);
        console.log("no Products",data);
    });
  }
  $scope.product();

  //get list of categories
  $scope.getCategoriesList = function(){

    Auth.getCategories().success (function (data) {
      console.log('get cat data', data);
      $scope.getCategoryList = data;
    }).error(function(data){
      console.log('data', data);
         console.log("no categories");
    });
  }
  $scope.activeTab = 0;
  $scope.categoryNames = "Add-ons";
  $scope.setActiveTab = function(tabToSet, categoryName){
      $scope.activeTab = tabToSet;
      $scope.categoryNames = categoryName;
      console.log("clicked",tabToSet);
  }

  //POST create add to cart
  var count = 0;
  $scope.addToCart = function(productId) {
    count++;

    //cookieStore
    $scope.getUserId = $cookieStore.get('userId');
    $scope.userToken = $cookieStore.get('token');
    $scope.sessionId = $cookieStore.get('sessionId');
    //check for no dupes on cart
    $scope.gettingCartIds = [];
    angular.forEach($scope.allCartItems, function(value, key) {
      var obj = {
        "cartIds": value._id,
        "cartQty": value.quantity,
        "productIds": value.product._id
      };
      $scope.gettingCartIds.push(obj);
    });

    //loop to check if prodct id exist in cart then increment qty
    $scope.incrementQty = false;
    $scope.addCart = false;
    for (var i = 0; i < $scope.gettingCartIds.length; i++) {
      console.log($scope.gettingCartIds[i].productIds);
      if ($scope.gettingCartIds[i].productIds === productId) {
        console.log("that cart id of prod", $scope.gettingCartIds[i].cartQty);
        console.log("call increment function");
        $scope.cartQuantity = $scope.gettingCartIds[i].cartQty;
        $scope.cartIds = $scope.gettingCartIds[i].cartIds;
        $scope.incrementQty = true;
      } else {
        console.log("i am here");
        $scope.addCart = true;
      }
    }

    if ($scope.incrementQty === true) {
      console.log('add to quantity');
      $scope.updateCartByIncrement($scope.cartQuantity, $scope.cartIds);
    } else if($scope.incrementQty === false && $scope.addCart === true || $scope.allCartItems.length === 0) {
      // do add to cart if not matching
      console.log('add new item');
      var addQuantity = 1;
      $scope.cartlist = [];
      var productInfo = {
        product: productId,
        quantity: addQuantity,
        UserID: $scope.getUserId,
        sessionID: $scope.sessionId,
        authToken: $scope.userToken,
        isDeleted: false
      }
      Auth.addCart(productInfo)
        .success(function(data) {
          //console.log('data', data);
          $scope.getcartItems();
          ngToast.create({
            className: 'success',
            content: 'Item Added to Cart'
          });

          angular.forEach(data, function(value, key) {
            var obj = {
              "user_id": value.UserID,
              "productId": value.product,
              "quantity": value.quantity,
            };
            $scope.cartlist.push(obj);
            console.log("cart", $scope.cartlist);
          });
        }).error(function(data) {
          ngToast.create({
            className: 'warning',
            content: 'Problem in Adding to Cart'
          });
        });
    }
  };

  //getCart items
  $scope.getcartItems = function () {
    // $scope.getUserId = localStorage.getItem('userId');
    // $scope.sessionId = "aa565asdasdy87sadasd987";
    //cookieStore
    $scope.getUserId = $cookieStore.get('userId');
    $scope.userToken = $cookieStore.get('token');
    $scope.sessionId = $cookieStore.get('sessionId');

    $scope.gettingCartData =[];
    console.log('cart page');
    Auth.getCartList({
      UserId : $scope.getUserId,
      sessionID: $scope.sessionId,
    })
    .success(function (data) {
      console.log(data.length);
      $rootScope.cartLength = data.length;
      $scope.allCartItems = data;
      console.log('get cart data',data);
      $scope.getCategoriesList();
      angular.forEach($scope.allCartItems, function (value, key) {
        var obj = {
          "qty":value.quantity,
          "cartPrice" : value.product.salePrice,
          "productIds" : value.product._id
        };
        $scope.gettingCartData.push(obj);

      });
      console.log("gettingCartData",$scope.gettingCartData);
      $scope.totalCost = 0;
      for (var i = 0; i < $scope.gettingCartData.length; i++) {
          $scope.totalCost += $scope.gettingCartData[i].qty * $scope.gettingCartData[i].cartPrice ;
            console.log("prce", $scope.totalCost);
      }


    }).error(function(data){
      ngToast.create({
        className: 'warning',
        content: 'Problem in Get Cart API'
      });
    });
  };
  $scope.getcartItems();

  //updateCart increment
  //$scope.countQuantity = 0;
  $scope.updateCartByIncrement = function(quantity,productId) {
    $scope.countQuantity =quantity + 1;
    console.log("countQuantity",$scope.countQuantity);
    $scope.getUserId = $cookieStore.get('userId');
    Auth.updateCart({UserID:$scope.getUserId, "quantity": $scope.countQuantity}, productId)
    .success(function(data){
      console.log('updated resp', data);
      ngToast.create({
        className: 'success',
        content: 'Quantity Increased in cart'
      });
      $scope.getcartItems();
        }).error(function(data){
          ngToast.create({
            className: 'warning',
            content: 'Problem in incrementing cart'
          });
        });
  }


      //slider
      // $('#myCarousel').carousel({
      //   interval: 1000000
      // })

      $('.carousel .item').each(function(){
        var next = $(this).next();
        if (!next.length) {
          next = $(this).siblings(':first');
        }
        next.children(':first-child').clone().appendTo($(this));

        if (next.next().length>0) {
          next.next().children(':first-child').clone().appendTo($(this));
        }
        else {
        	$(this).siblings(':first').children(':first-child').clone().appendTo($(this));
        }
      });


      //google maps
      var locations = [
    ['Downtown Dubai', 25.194985, 55.278414, 4],
    ['Jumeira 1', 25.220111, 55.256308, 5],
    ['Al Wasl', 25.2048, 55.2708, 3],
    ['The Palm Jumeirah', 25.1124, 55.1390, 2],
    ['Jebel Ali Village', 	25.029235, 	55.132065, 1]
  ];

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: new google.maps.LatLng(25.27, 55.29),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  var infowindow = new google.maps.InfoWindow();

  var marker, i;

  for (i = 0; i < locations.length; i++) {
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(locations[i][1], locations[i][2]),
      map: map
    });

    google.maps.event.addListener(marker, 'click', (function(marker, i) {
      return function() {
        infowindow.setContent(locations[i][0]);
        infowindow.open(map, marker);
      }
    })(marker, i));
  }

  //Note :redirect to show wish list
$scope.showWishList = function(){
  $location.path('/search-page').search({
    show_wishlist: true,

  });
}

//NOTE: redirect to search on click product
  $scope.showProductSearchPage = function(productName){
    $location.path('/search-page').search({
      show_productDetails: productName,
    });
  }

})
