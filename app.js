// JavaScript source code

var app=angular.module('myApp', ['ngRoute']);

app.config(function(){
	Stamplay.init("codeblogit");
})

app.config(function($routeProvider, $locationProvider){

	$locationProvider.hashPrefix('');

	$routeProvider
		.when('/' , {
			templateUrl: "templates/home.html",
			controller: "homeCtrl"
		})

		.when('/login' , {
			templateUrl: "templates/login.html",
			controller: "loginCtrl"
		})

		.when('/signup' , {
			templateUrl: "templates/signup.html",
			controller: "signupCtrl"
		})
})

// app.controller('homeCtrl', function($scope, $http){
// 	var API_KEY = "53b5e757611a67783fcc501a3f5ed57a";

// 	$http.get("http://api.openweathermap.org/data/2.5/weather?q=bhopal&APPID="+API_KEY)
// 	.then(success, failure);

// 	function success(response) {
// 		console.log(response);
// 		$scope.weatherData = response.data;
// 	}

// 	function failure(err) {
// 		console.log(err);
// 	}

// 	$scope.warn = function() {
// 		alert("You fool!");
// 	}
// });

app.controller('loginCtrl', function($scope){
	$scope.login = function(){
		Stamplay.User.currentUser()
		.then(function(response){
			console.log(response);
		}, function(error){
			console.log(error);
		});
	}

	$scope.login = function(){
		Stamplay.User.currentUser()
		.then(function(response){
			console.log(response);
			if (response.user){
				$timeout(function(){
					$location.path("/viewBlogs");
				});
			}	else	{
				Stamplay.User.login($scope.user)
				.then(function(response){
					console.log("logged In"+ response);
					$timeout(function(){
						$location.path("/viewBlogs");
					});
				}, function(error){
					console.log(error);
				})
			}
		});
	}
});

app.controller('signUpCtrl', function($scope){
	$scope.newUser = {};
	$scope.signUp = function(){

		if($scope.newUser.firstName && $scope.newUser.lastName && $scope.newUser.email && $scope.newUser.password && $scope.newUser.confirmPassword){
			console.log("All fields are valid");

			if ($scope.newUser.password == $scope.newUser.confirmPassword){
				console.log("All good! Lets sign up!");
				 Stamplay.User.signup($scope.newUser)
				 .then(function(response){
				 	console.log(response);
				 })
			}	else	{
				console.log("Password do not match!");
			}
		}	else	{
			console.log("Some fields are invalid");
		}
	};
})
