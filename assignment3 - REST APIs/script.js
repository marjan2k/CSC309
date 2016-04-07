$(document).ready(function() {
    var colors = ["#e74c3c", "#1abc9c", "#2ecc71"];
    $("#tweets").click(function(){
        $("#output").empty();
        $.get("/tweets", function(result){
            for (i=0; i<result.length; i++){
                var html = "<div class='tweet'>";
                for (var key in result[i]) {
                    var line = "<strong>" + key + ": </strong>" + result[i][key] + "\n";
                    console.log(line);
                    html += "<p> " + line + "</p>";
                }
                html += "</div>";
                $("#output").append('<li style="background-color:' + colors[i % 3] + ';"' + html + '</li>');
            }
        });
    });
    $("#users").click(function(){
        $("#output").empty();
        $.get("/users", function(result){
            for (i=0; i<result.length; i++){
                var html = "<div class='users'>";
                for (var key in result[i]) {
                    var line = "<strong>" + key + ": </strong>" + result[i][key] + "\n";
                    console.log(line);
                    html += "<p> " + line + "</p>";
                }
                html += "</div>";
                $("#output").append('<li style="background-color:' + colors[i % 3] + ';"' + html + '</li>');
            }
        });
    });
    $("#links").click(function(){
        $("#output").empty();
        $.get("/links", function( result ) {
            for (i=0; i<result.length; i++){
                var html = "<div class='links'>";
                for (var key in result[i]) {
                    var line = "<strong>" + key + ": </strong>" + result[i][key] + "\n";
                    console.log(line);
                    html += "<p> " + line + "</p>";
                }
                html += "</div>";
                $("#output").append('<li style="background-color:' + colors[i % 3] + ';"' + html + '</li>');
            }
        });
    });
    $("#unique_tweet").click(function(){
        $("#output").empty();
        $.get("/unique_tweet", {id: $('#un_tweet').val()}, function(result){
            for (i=0; i<result.length; i++){
                var html = "<div class='uni_tweet'>";
                for (var key in result[i]) {
                    var line = "<strong>" + key + ": </strong>" + result[i][key] + "\n";
                    console.log(line);
                    html += "<p> " + line + "</p>";
                }
                html += "</div>";
                $("#output").append('<li style="background-color:' + colors[i % 3] + ';"' + html + '</li>');
            }
        });
    });
    $("#unique_user").click(function(){
        $("#output").empty();
        $.get("/unique_user", {name: $('#un_user').val()}, function(result){
            for (i=0; i<result.length; i++){
                var html = "<div class='uni_user'>";
                for (var key in result[i]) {
                    var line = "<strong>" + key + ": </strong>" + result[i][key] + "\n";
                    console.log(line);
                    html += "<p> " + line + "</p>";
                }
                html += "</div>";
                $("#output").append('<li style="background-color:' + colors[i % 3] + ';"' + html + '</li>');
            }
        });
    });
    
});