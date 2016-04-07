/* <!DOCTYPE html>
<html>

<head>
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.5.3/angular.min.js"></script>
</head>
<body>

<div ng-app="myApp" ng-controller="event_listings"> 

<table>
  <tr ng-repeat="x in result">
    <td>{{ x.name }}</td>
    <td>{{ x.organization }}</td>
  </tr>
</table>

</div>
</body>

<script>

</script>
</html> */


$(document).on('click','.collapse.in',function(e) {
        e.stopPropagation();
        //console.log("Clicked Not Collapse");
});


$(window).load(function() {
    var user=document.getElementById("userdata").innerHTML;
    var newuser=JSON.parse(JSON.stringify(user));
    console.log(typeof newuser);
    console.log(newuser[0]);
});



var app = angular.module('myApp', []);

app.controller('ListingController', function($scope, $http){
    var user=document.getElementById("userdata").innerHTML;
    //user=JSON.parse(user);
    //console.log(typeof user);
    //console.log(user);
    $http.get("/event/live").success(function(response){
        console.log(response.length);
        $scope.events=response;
        for (i = 0; i < $scope.events.length; i++) {
            $scope.events[i].btnclass="btn btn-default";
        }
  
        //console.log($scope);
        
        
    });
    $scope.SearchListing=function(search_term){
        $http.get("/search/event/"+search_term).success(function(response){
            if (response.length<=1)
            $scope.events=[];
            $scope.events=(response);
            console.log(typeof $scope.events);
            console.log($scope.events);
        });
        //console.log(search_term);
        
    };
    console.log("changing button class to btn-default");
    $scope.UpdateListing=function(eventindex){
        var event_name=$scope.events[eventindex-1].name;
        var email=document.getElementById("useremail").innerHTML;
        
        console.log($scope.events[eventindex-1].btnclass);
         if ($scope.events[eventindex-1].btnclass==="btn btn-default"){
             $http.put("/event/addVolunteer", {'event_name':event_name, 'email':email}).success(function(response){
                 $scope.events[eventindex-1].btnclass="button-success";
                //console.log($scope.btnclass);
                console.log("changing button class to btn-success");
             });
        }
        else{
            $http.put("/event/updateVolunteer", {'event_name':event_name, 'email':email, 'status':3}).success(function(response){
                $scope.events[eventindex-1].btnclass="btn btn-default";
                console.log("Class already  btn-default");
            });
                
            
        }
        
    };
        
});
