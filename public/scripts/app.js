$(() => {
  $.ajax({
    method: "GET",
    url: "/api/users"
  }).done((users) => {
    for(user of users) {
      $("<div>").text(user.name).appendTo($("body"));
    }
  });;

  $("#search-property-form__cancel").click(function(){
    $("#search-property-form").trigger("reset");
  });


});

//Put jquery here to expand and read received messages (slideToggle jquery function to expand message)
