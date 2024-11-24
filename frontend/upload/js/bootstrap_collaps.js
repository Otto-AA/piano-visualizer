$(document).ready(function () {
	// Extend Bootstraps collapse functions for multiple elements
	extend_bootstrap_collaps();
});



// Extend Bootstraps collapse for select elements
function extend_bootstrap_collaps() {
	// Select
	$('select[data-toggle-aa=collapse]').change(function () {
		$(this).children().each(function () {
			let data_target = $(this).attr("data-target");
			if (data_target === undefined) return;
			let action = $(this).is(":selected") ? "show" : "hide";
			$(data_target).collapse(action);
		});
	});
	// Initial call to ensure that it is opened after loading
	$('select[data-toggle-aa=collapse], input[type="file"][data-toggle-aa=collapse]').children(':selected').each(function () {
		$($(this).attr("data-target")).collapse("show");
	});

	// Input file
	$('input[type="file"][data-toggle-aa="collapse"]').change(function () {
		$($(this).attr("data-target")).collapse("show");
	});

	// Initial call
	if ($('input[type="file"][data-toggle-aa="collapse"]').val())
		$($('input[type="file"][data-toggle-aa="collapse"]').attr("data-target")).collapse("show");

}
