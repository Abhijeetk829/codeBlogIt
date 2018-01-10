// JavaScript source code

var app=angular.module('myApp', ['ui.router', 'ngToast', 'textAngular']);

app.factory('auth', function($q, $rootScope){
	return {
		isAuthenticated : function(){
			var defer = $q.defer();
			Stamplay.User.currentUser(function(error, response){
				if (error){
					defer.reslve(false);
					$rootScope.loggedIn = false;
				}
				if (response.user){
					defer.resolve(true);
					$rootScope.loggedIn = true;
				}	else {
					defer.resolve(false);
					$rootScope.loggedIn = false;
				}
			});
			return defer.promise;
		}
	}
});

app.run(function($rootScope, auth, $state, $transitions){

	$transitions.onStart({}, function(transition){
		if(transition.$to().self.authenticate == true){
			auth.isAuthenticated()
			.then(function(response){
				console.log(response);
				if(response == false){
					$state.go('login');
				}
			});
		}
	})

	/*$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
		if (toState.authenticate == true){
			auth.isAuthenticated()
			.then(function(response){
				if (response == false){
					$state.go('login');
				}
			});
		}
	})*/

	/*Stamplay.User.currentUser()
		.then(function(response){
			// console.log(response);
			if(response.user){
				$rootScope.loggedIn = true;
				$rootScope.displayName = response.user.firstName+" "+response.user.lastName;
				// $state.go('viewblogs');
			}	else	{
				$rootScope.loggedIn = false;
				// console.log($rootScope.loggedIn);
			}
		}, function(error){
			// console.log("An error ocurred while getting current user!")
		});*/

		// auth.isAuthenticated()
		// .then(function(response){
		// 	console.log(response);
		// })
});

app.filter('toPlainText', function(){
	return function (text) {
		return text ? String(text).replace(/<[^>]+>/gm, '') : '';
	}
});

app.config(function($stateProvider, $urlRouterProvider){

		Stamplay.init("codenameblogit");

		$stateProvider
			.state('home', {
				url: '/',
				templateUrl: 'templates/home.html',
				controller: "homeCtrl"
			})

			.state('login', {
				url: '/login',
				templateUrl: 'templates/login.html',
				controller: "loginCtrl"
			})

			.state('signup', {
				url: '/signup',
				templateUrl: 'templates/signup.html',
				controller: "signUpCtrl"
			})

			.state('newblog', {
				url: '/newblog',
				templateUrl: 'templates/newblog.html',
				controller: "newblogCtrl",
				authenticate: true
			})

			.state('myblogs', {
				url: '/myblogs',
				templateUrl: 'templates/myblogs.html',
				controller: "myblogsCtrl",
				authenticate: true
			})

			.state('edit', {
				url: '/edit/:id',
				templateUrl: 'templates/edit.html',
				controller: 'editCtrl',
				authenticate: true
			})

			.state('view', {
				url: '/view/:id',
				templateUrl: 'templates/view.html',
				controller: 'viewCtrl'
			})

		$urlRouterProvider.otherwise("/");
});

app.controller('homeCtrl', function($scope, $http){
	var API_KEY = "53b5e757611a67783fcc501a3f5ed57a";
	$scope.city ;
	$scope.latestBlogs = {};

	$scope.weatherQuery = function(currentCity, condition){

		if (condition == true) {
			currentCity = $scope.city;
		}
		$http.get("http://api.openweathermap.org/data/2.5/weather?q="+currentCity+"&APPID="+API_KEY)
		.then(success, failure);

		function success(response) {
			// console.log(response);
			$scope.weatherData = response.data;
			var k = response.data.main.temp;
			var c = k-273.15;
			$scope.temprature = c.toFixed(0);
		}

		function failure(err) {
			// console.log(err);
		}

		$scope.warn = function() {
			alert("You fool!");
		}
	}

	Stamplay.Object("blogs").get({sort: "-dt_create"})
	.then(function(response){
		// console.log(response);
		$scope.latestBlogs = response.data;
		$scope.$apply();
		// console.log($scope.latestBlogs);
	}, function(error){
		// console.log(error);
	});

	$scope.weatherQuery("Bhopal","false")
});

app.controller('loginCtrl', function($scope, $state, $timeout, $rootScope, ngToast){
	$scope.login = function(){
		Stamplay.User.currentUser()
		.then(function(response){
			// console.log(response);
			if (response.user){
				$rootScope.loggedIn = true;
				$rootScope.displayName = response.user.firstName+" "+response.user.lastName;
				$state.go('myblogs');
			}	else	{
				//proceed with login
				Stamplay.User.login($scope.user)
				.then(function(response){
					$rootScope.loggedIn = true;
					$rootScope.displayName = response.user.firstName+" "+response.user.lastName;
					ngToast.create("Login Successful!");
					$timeout(function(){
						$state.go('myblogs');
					});
				}, function(error){
					$timeout(function() {
						ngToast.create("An error occurred, please try later!");
					});
					$rootScope.loggedIn = false;
				})
			}
		}, function(error){
			timeout(function() {
				ngToast.create("An error occurred, please try later!");
			});
		});
	}
});

app.controller('signUpCtrl', function($scope, $rootScope, $state, ngToast, $timeout){
	$scope.newUser = {};
	$scope.signUp = function(){

		if($scope.newUser.firstName && $scope.newUser.lastName && $scope.newUser.email && $scope.newUser.password && $scope.newUser.confirmPassword){
			// console.log("All fields are valid");

			if ($scope.newUser.password == $scope.newUser.confirmPassword){
				 Stamplay.User.signup($scope.newUser)
				 .then(function(response){
				 	$timeout(function() {
				 		ngToast.create("Congratulations on creating your new account! You may login now...");
				 		$rootScope.loggedIn = true;
				 	});
				 	$state.go("login");
				 }, function(error) {
				 	$timeout(function() {
				 		ngToast.create("Error occurred, please try later!");
				 	});
				 });
			}	else	{
				$timeout(function() {
					ngToast.create("Passwords do not match!");
				});	
			}
		}	else	{
			$timeout(function(){
				ngToast.create("Some fields are invalid!");
			});
		}
	};
});

app.controller('mainCtrl', function($scope, $rootScope, $timeout, $state, ngToast){
	$scope.logout = function(){
		// console.log("Logout called")
		Stamplay.User.logout(true, function(){
			ngToast.create("Logged out successfully!")
			$timeout(function() {
				$rootScope.loggedIn = false;
			});
			$state.go('home');
		});
	};
});

app.controller('newblogCtrl', function($scope, taOptions, $state, ngToast, $timeout){

	$scope.newBlog = {};

	 taOptions.toolbar = [
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
      ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
      ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
      ['html', 'insertImage','insertLink', 'insertVideo', 'wordcount', 'charcount']
  	];

  	$scope.newblog = function(){
  		Stamplay.Object("blogs").save($scope.newBlog)
  		.then(function(response){
  			ngToast.create("Blog published successfully!")
  			$state.go('myblogs');
  		});
  	}, function(error){
  		$timeout(function() {
  			ngToast.create("An error occurred while creating blog post. Try again later");
  		});
  		$state.go('home');
  	}
});

app.controller('myblogsCtrl', function($scope, $state){
	Stamplay.User.currentUser()
	.then(function(response){
		if (response.user){
			Stamplay.Object("blogs").get({owner: response.user._id, sort: "-dt_create"})
			.then(function(response){
				// console.log(response);
				$scope.userBlogs = response.data;
				$scope.$apply();
				// console.log($scope.userBlogs);
			}, function(error){
				// console.log(error);
			});
		}	else {
			$state.go('login');
		}
		
	}, function(error){
		// console.log(response);
	});
});

app.controller('editCtrl', function($scope, $state, taOptions, $stateParams, ngToast, auth){

	$scope.post = {};

	taOptions.toolbar = [
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
      ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
      ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
      ['html', 'insertImage','insertLink', 'insertVideo', 'wordcount', 'charcount']
  	];

  	auth.isAuthenticated()
  	.then(function(response){
  		if (response == true){
  			Stamplay.Object("blogs").get({_id: $stateParams.id})
		  	.then(function(response){
		  		// console.log(response);
		  		$scope.post = response.data[0];
		  		$scope.$apply();
		  		// console.log($scope.post);
		  	}, function(error){
		  		// console.log(error);
		  	});
  		}
  	})  	

  	$scope.update = function(){
  		Stamplay.User.currentUser()
  		.then(function(response){

  			if (response.user){
  				if (response.user._id == $scope.post.owner){
  					Stamplay.Object("blogs").update($stateParams.id, $scope.post)
  					.then(function(response){
  						// console.log(response);
  						$state.go('myblogs');
  					}, function(error){
  						// console.log(error);
  					});
  				}	else	{
  					$state.go('login');
  				}
  			}	else	{
  				$state.go('login');
  			}
  		}, function(error){
  			// console.log(error);
  		});
  	}
});

app.controller('viewCtrl', function($scope, $stateParams, $state, $timeout, ngToast){

	$scope.upvoteCount = 0;
	$scope.downvoteCount = 4;

	Stamplay.Object("blogs").get({_id: $stateParams.id})
	.then(function(response){
		$scope.blog = response.data[0]
		console.log($scope.blog)
		// $scope.apply();
		// console.log($scope.blogPost);
	}, function(error){
		console.log(error)
	})
});