$(() => {
  $.ajax({
    method: "GET",
    url: "/api/users"
  }).done((users) => {
    for(user of users) {
      $("<div>").text(user.name).appendTo($("body"));
    }
  });;

  //  Fetch
  $('#search-property-form').submit((event) => {
    event.preventDefault();
    // post request to get search results returned.
    // in the then of the ajax, append results list to the empty content container in index.ejs. (use template literals)
    console.log('search form submitted')
  });



});

//Put jquery here to expand and read received messages (slideToggle jquery function to expand message)
