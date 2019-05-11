/* eslint-disable */
$(document).ready(function () {
  $('.datepicker').datepicker();
  $('.timepicker').timepicker();

  $("#createEvent").on("click", function (event) {
    event.preventDefault();
    const newEvent = {
      name: $("#name").val(),
      venue: $("#venue").val(),
      startTime: `${$("#startDate").val()} ${$("#startTime").val()}`,
      endTime: `${$("#endDate").val()} ${$("#endTime").val()}`,
      description: $("#description").val()
    };
    $.ajax({
      url: "/Event",
      method: "POST",
      data: newEvent
    }).then(result => {
      location.href = "/Events";
    }).fail(err => {
      console.log(err);
      M.toast({ html: "Something went wrong"});
    })
  });
});
