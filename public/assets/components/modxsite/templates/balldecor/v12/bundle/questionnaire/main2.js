$(document).ready(function(){
	$('.our-works-slider').slick({
		infinite: true,
		slidesToShow: 3,
		slidesToScroll: 1,
		dots: false,
		responsive: [
		{
			breakpoint: 981,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1,
				infinite: true,
				dots: false
			}
		},
		{
			breakpoint: 481,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
				infinite: true,
				dots: false
			}
		}
		]
	});

	// $(".our-works .slick-slide a").fancybox();
	$('[data-fancybox="gallery"]').fancybox({
		buttons : [
		'zoom',
		'thumbs',
		'close'
		]
	});


	var timerId = 0;
	$(".main-btn").fancybox({
		buttons : [
		'close'
		],
		iframe : {
			css : {
				width : '100%',
				maxWidth: '1170px'
			}
		},
		afterLoad: function () {
			$('iframe').on('load', function(event) {
				event.preventDefault();
				frameHeight();
			});

			setTimeout(function() {
				frameHeightRec();
			}, 300);

			$(window).on('resize', function() {
				frameHeight();
			});
		},
		afterClose: function () {
			clearTimeout(timerId);
			// console.log('clear');
		}
	});

	function frameHeight () {
		var height = $('iframe').contents().find('html').height();
		$('iframe').height(height);
	}

	function frameHeightRec () {
		var height = $('iframe').contents().find('html').height();
		$('iframe').height(height);
		timerId = setTimeout(function() {
			frameHeightRec();
		}, 100);
		// console.log('call');
	}

	stockDay();
	function stockDay() {	
		var date = new Date();
		date.setDate(date.getDate() + 3);
		var dayOfMonth = date.getDate();
		var month = date.getMonth();
		var textM;
		var textout;

		if (month==0) textM ="января";
		if (month==1) textM ="февраля";
		if (month==2) textM ="марта";
		if (month==3) textM ="апреля";
		if (month==4) textM ="мая";
		if (month==5) textM ="июня";
		if (month==6) textM ="июля";
		if (month==7) textM ="августа";
		if (month==8) textM ="сентября";
		if (month==9) textM ="октября";
		if (month==10) textM ="ноября";
		if (month==11) textM ="декабря";

		textout = dayOfMonth + ' ' + textM;

		$('#stockDay').text(textout);

		//console.log (dayOfMonth);
  		//console.log (month + 1);
  		//console.log (textout);
	}

});