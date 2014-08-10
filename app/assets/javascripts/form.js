/*
$ ->
  if $("#place_type option:selected").text() != "Events" 
    $(".form-date").hide()

$("#place_date").datepicker({dateFormat: "D, MM dd, yy"})

$("#place_type").change ->
  alert 'hello'
  if $("#place_type option:selected").val() is "event"
    $(".form-date").slideToggle()
    console.log $("#place_type option:selected").text()
    $("#place_date").attr("required", "required")
  else
    if $("#place_date").is(":visible")
    
      $(".form-date").slideToggle()
      $("#place_date").removeAttr("required", "required")
*/


$(document).ready(function() {


    $(".label_description_big").text("תארו באיזה אופן אתם מעוניינים לאפשר לצרכנים לצרוך מכם : ציינו ימי מכירה מרוכזים - מיקום ושעות, כתובת להזמנות אונליין, מבצעים, הנחות, וכל מידע שנראה לכם רלוונטי.")
    $('#place_type').on('change', function() {
        lab_descr = $(".label_description_big");
        if (this.value == 'south_company') {

            lab_descr.text("תארו באיזה אופן אתם מעוניינים לאפשר לצרכנים לצרוך מכם ציינו ימי מכירה מרוכזים - מיקום ושעות, כתובת להזמנות אונליין, מבצעים, הנחות, וכל מידע שנראה לכם רלוונטי .");
        } else {
            lab_descr.text("איזה שינוי חברתי אתם שואפים ליצור וכיצד אתם מבצעים זאת?");
        }
    });

    $('#modal_add').on('shown', function() {

        var latlng = new google.maps.LatLng(31.9298264, 34.768551);

        google.maps.event.trigger(map_form, "resize");
        map_form.setCenter(latlng);

    });

});