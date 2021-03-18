// For input Animations

jQuery("input").focus(function () {
  jQuery(this).parent("div").addClass("beforeTrans");
});
jQuery("input").blur(function () {
  if (jQuery(this).val() == "")
    jQuery(this).parent("div").removeClass("beforeTrans");
});

if ($("input").val()) {
  $("input").focus();
}

jQuery("ul li a")
  .on("mouseover", function () {
    $(this).parent().addClass("hovered");
  })
  .on("mouseout", function () {
    $(this).parent().removeClass("hovered");
  });

  