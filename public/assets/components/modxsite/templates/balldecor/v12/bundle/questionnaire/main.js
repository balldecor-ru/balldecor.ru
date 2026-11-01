$(document).ready(function() {

    // $('input[name="phone"]').mask('+7 (999) 999-99-99');

    $('.step-slide__title').each(function(index, el) {
        $(el).prepend('<div class="step-slide__title-counter">' + (index + 1) + '</div>');
    });

    for (var i = 0; i < $('.step-slide').length - 1; i++) {
        $('.step__extender').append('<div class="step__extender-item"></div>');
    };

    var progress = {
        current: ( 100 / ($('.step-slide').length - 1) ),
        total: $('.step-slide').length,
        width: ( 100 / ($('.step-slide').length - 1) ),
        process: doProgress
    };

    // console.log(progress);


    function doProgress () {}

    var testSlider = $('.test-slider').bxSlider({
        mode: 'fade',
        infiniteLoop: false,
        speed: 0,
        adaptiveHeight: true,
        adaptiveHeightSpeed: 0,
        touchEnabled: false,
        pager: false,
        nextSelector: '.btn-next-container',
        nextText: '<div class="btn-next"><span>на следующий шаг</span></div>',
        prevSelector: '.btn-prev-container',
        prevText: '<div class="btn-prev"><span>назад</span></div>',
        onSliderLoad: function (currentIndex) {
            // первоначальные стили
            $('.main-progress__text').eq(currentIndex).addClass('main-progress__text_active');
            $('.step__extender-item').eq(currentIndex).addClass('step__extender-item_active');
            $('.main-progress__extender').css('width', progress.width + '%');
        },
        onSlideAfter: function (slideElement, oldIndex, newIndex) {
            // активация кнопок
            $('.btn-next-container').removeClass('btn-next-container_active');
            $('.btn-next').removeClass('btn-next_active btn-shine');

            // изменение полосы загрузки
            progress.current += progress.width;
            $('.main-progress__extender').css('width', progress.current + '%');

            // изменение шага
            $('.step__extender-item').eq(newIndex).addClass('step__extender-item_active');
            $('.step__text span').html(newIndex + 1);

            // изменение заголовка в полосе загрузки
            if ($('.main-progress__text').eq(newIndex).length != 0) {
                $('.main-progress__text').eq(oldIndex).removeClass('main-progress__text_active');
                $('.main-progress__text').eq(newIndex).addClass('main-progress__text_active');
            }
            ;

            var toTopDoc = window.parent.document.querySelector('.fancybox-slide--iframe');

            $(toTopDoc).animate({scrollTop: 0}, 0);

        },

        onSlideBefore: function(slideElement,oldIndex,newIndex){
            console.log(newIndex);
            if(newIndex > 0){
                $('.fb-prev').show();
            }
            else {
                $('.fb-prev').hide();
            }
            currentSlide = $(slideElement);

            question = currentSlide.find('.step-slide__title').text();


            $('.header-line__title .step-slide__title-counter').text(newIndex+1);
            if($(slideElement).closest('.test-slider').hasClass('test-slider_first')){
                val1 = $('input[name="step0"]:checked').val();

                $('input[name="step1"]').closest('.pick-item').hide();

                if(val1 == 'Строительство'){
                    $('.pick-item.js-type-1').show();
                }
                else if(val1 == 'Проектирование'){
                    $('.pick-item.js-type-2').show();
                }
                else if(val1 == 'Изыскания'){
                    $('.pick-item.js-type-3').show();
                }


            }

        }

    });
    $('.container').prepend('<div class="fb-prev"><</div>');
    $(document).on('click', '.fb-prev', function(){
        testSlider.goToPrevSlide();
    });
    $(document).on('click', '.fb-close', function(){
        parent.jQuery.fancybox.getInstance().close();
    });
    $('.pick-item').on('change', function(event) {
        event.preventDefault();
        $('.btn-next-container').addClass('btn-next-container_active');
        $('.btn-next').addClass('btn-next_active btn-shine');
    });

    $('.pick-item_inp').on('keyup', function(event) {
        event.preventDefault();
        $('.btn-next-container').addClass('btn-next-container_active');
        $('.btn-next').addClass('btn-next_active btn-shine');
    });

    $('.step_slide_0 #next0').addClass('btn-next-container_active');
    $('.step_slide_0 #next0 .btn-next').addClass('btn-next_active btn-shine');


    $('form').each(function(index, el) {
        var form_data = $(this).serialize();
        $('form').trigger('reset');
        $(el).validate({
            rules:{				"phone":{ required:true }
            },
            submitHandler: function(form){
                $(form).ajaxSubmit({
                    type: 'POST',
                    url: '/assets/components/modxsite/connectors/mail.php',
                    data: form_data,

                    success: function(data) {
                        testSlider.goToSlide( $('.step-slide').length - 1 );
                        
                        //$('.header-line').slideUp(300);
                        //$('.progress-line').slideUp(300);
                        location.href = '/thanks.html';
                    }
                });
            }
        });
    });

    /*
    $("form").each(function() {
        $(this).submit(function() {

                var form_data = $(this).serialize();
                $.ajax({
                    url: '../scripts/mail.php',
                    type: 'POST',
                    data: form_data,
                    success: function() {
                        testSlider.goToSlide( $('.step-slide').length - 1 );
                        $('.header-line').slideUp(300);
                        $('.progress-line').slideUp(300);
                    },
                });
        });
    });
    */


    //test
    /*
    $('.header-line__logo').click(function (){
        var step1 = $('input[name="step1"]:checked').val();
        var step2 = $('input[name="step2"]:checked').val();
        var step3 = $('input[name="step3"]:checked').val();
        var step4 = $('input[name="step4"]').val();
        var step5 = $('input[name="step5"]:checked').val();

        console.log(test, step1, step2, step3, step4, step5);
    });
    */

    //Скролл меню
    $(".phone-input").click(function () {
        //event.preventDefault();
        var minus = 60;
        var id  = $(this),
            top = $(id).offset().top - minus;
        $('body,html').animate({scrollTop: top}, 500);
    });

    // $(".phone-input").click(function () {
    //     event.preventDefault();
    //     var minus = 60;
    //     var id  = $(this).attr('href'),
    //         top = $(id).offset().top - minus;
    //     $('body,html').animate({scrollTop: top}, 1500);
    // });
});

