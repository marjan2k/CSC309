var orgProfileCreated = false;
$(document).ready(function () {	
    var user_email = document.getElementById("user_email").innerHTML;
	// codes works on all bootstrap modal windows in application
	$('.modal').on('hidden.bs.modal', function(){
	$(this).find('form')[0].reset();
	});
	//Organization Form
	$("#btn_organizationForm_submit").click(function(){
		console.log($('#organization_name').val());
		console.log(user_email);
		console.log($('#organization_type').val());
		console.log($("#organization_description").val());
		console.log($("#organization_website").val());
		console.log($('#organization_address').val());
		console.log($('#organization_number').val());
	
		$.post("/organization", {
						organization: $('#organization_name').val(),
						type: $('#organization_type').val(),
						email: user_email,
						website: $("#organization_website").val(),
  						description: $("#organization_description").val(),
  						address: $('#organization_address').val(),
  						number: $('#organization_number').val(),
						},function(result){
			console.log("Organization Created");
			orgProfileCreated = true;
			});				
		});
	//Volunteer Form
	$("#btn_volunteerForm_submit").click(function(){
		var rawDate = $("#volunteer_birth_date").datepicker('getDate');
			console.log(rawDate);
		var textDate = $.datepicker.formatDate('yy-M-dd', rawDate);
		console.log($('#volunteer_name').val());
		console.log(user_email);
		console.log(textDate);
		console.log($('#volunteer_address').val());
		console.log($('#volunteer_number').val());
     	var dataObject = { 
						name: $('#volunteer_name').val(),
						email: user_email,
						birth_date: textDate,
  						address: $('#volunteer_address').val(),
  						number: $('#volunteer_number').val()
		};
        $.ajax({
            url: "/user",
            type: 'PUT',    
            data: dataObject,
            dataType: 'json',
            success: function(result) {
                alert("success?");
            }
        });		
		
	});
	$("#volunteer_birth_date").datepicker();
});

var showOrganizationModal = angular.module("showOrganizationModal", [])
.controller("checkIfProfileExists", function($scope) {
	var tempData = [];
	var request = "/organization/" + "lishanguo0@gmail.com"; 
	var result = $.get(request);
	$.get(request, function( data ) {
  	$( ".result" ).html( data );
  	console.log(data);
	if (data && data !=""){
		$scope.profileExist = true;
		console.log($scope.profileExist);
	}
	else {
		$scope.profileExist = false;
		console.log($scope.profileExist);
	}
	if(orgProfileCreated == true){
		console.log("profile now is created");
		$scope.profileExist = true;
	}					
	})
	
});

//Combine Modules under the same ng-app name
	angular.module("CombineModule", ["showOrganizationModal"]);		