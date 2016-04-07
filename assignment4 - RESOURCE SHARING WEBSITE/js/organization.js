$(document).on('click','.collapse.in',function(e) {
        e.stopPropagation();
        //console.log("Clicked Not Collapse");
});


/* $(window).load(function() {
    var user=document.getElementById("userdata").innerHTML;
    //console.log(user);
}); */

var app = angular.module('myApp', []);
app.controller('OrganizationHandler', function($scope, $http){

    $http.get("/event/live").success(function(response){
        $scope.events=response;
        for (i = 0; i < $scope.events.length; i++) {
            $scope.events[i].btnclass="btn btn-default";
        }
  
        console.log($scope);
        
    });
    console.log("changing button class to btn-default");
    $scope.UpdateListing=function(eventindex){

        console.log($scope.events[eventindex-1].btnclass);
         if ($scope.events[eventindex-1].btnclass==="btn btn-default"){
            $scope.events[eventindex-1].btnclass="button-success";
            //console.log($scope.btnclass);
            console.log("changing button class to btn-success");
        }
        else{
            $scope.events[eventindex-1].btnclass="btn btn-default";
            console.log("Class already  btn-default");
        } 
        
    };
        
});

var postSkillList = [];
$(document).ready(function () {	
    var user_email = document.getElementById("user_email").innerHTML;
	$("#event_date").datepicker();
	// codes works on all bootstrap modal windows in application
	$('.modal').on('hidden.bs.modal', function(){
	$(this).find('form')[0].reset();
	});
	//Event Form: Convert date to text
	$("#btn_eventForm_submit").click(function(){
		var rawDate = $("#event_date").datepicker('getDate');
			console.log(rawDate);
		var textDate = $.datepicker.formatDate('yy-M-dd', rawDate);
		console.log($('#event_name').val());
		console.log(user_email);
		console.log($("#organization_name").val());
		console.log(textDate);
		console.log($('#event_location').val());
		console.log($('#event_description').val());
		console.log(postSkillList);
		console.log($('#event_numOfVolunteers').val());
		
		$.post("/event", {
						name: $('#event_name').val(),
						organization: $('#organization_name').val(),
						email: user_email,
						description: $('#event_description').val(),
						date: textDate,
						location:$('#event_description').val(),
						lookingFor: postSkillList,
						num_of_volunteers: $('#event_numOfVolunteers').val(),
						status:1 //All Events Initially set to Live (i.e. Status = 1)
						},function(result){
			console.log("The Event has been Posted");
			//Reset all values to 0
			postSkillList = [];
			textDate = "";
			});				
		});
	
});

//Event Form: Module - Add Skills to the List
		var skillsList = angular.module("skillsLookingFor", []); 
			skillsList.controller("addRemoveItem", function($scope) {
				$scope.skills = [];
				$scope.addItem = function () {
					$scope.errortext = "";
					if (!$scope.skill) {
						return;
					}
					if ($scope.skills.indexOf($scope.skill) == -1) {
						$scope.skills.push($scope.skill);
						$scope.skill = "";
					} else {
						$scope.errortext = "The item is already in your skills list.";
						$scope.skill = "";
					}
				}
				$scope.removeItem = function (x) {
					$scope.errortext = "";    
					$scope.skills.splice(x, 1);
				}
				$scope.clearList = function (){
					postSkillList = $scope.skills;
					$scope.skills = [];
				}
			});	
		//Combine Modules under the same ng-app name
		angular.module("CombineModule", ["skillsLookingFor"]);		
