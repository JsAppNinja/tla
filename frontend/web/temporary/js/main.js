(function ($) {
    $(function () {
        var students_count = parseInt($('#students_count').attr('data-count')) + 50;
        var tutors_count = parseInt($('#tutors_count').attr('data-count')) + 30;

        if(students_count || tutors_count) {
            var students = new CountUp("students_count", 0, students_count, 0, 3.5, {
                useEasing: true,
                useGrouping: true
            });
            students.start();

            //var tutors = new CountUp("tutors_count", 0, tutors_count, 0, 2.5, {
            //    useEasing: true,
            //    useGrouping: true
            //});
            //tutors.start();
        }

        var loginFormVisible = false;

        //$(document).on("scroll", onScroll);

        $(".login").click(function () {
            $(".slide_up_login").slideDown('slow');
            loginFormVisible = true;
        });
        $(".close_btn").click(function () {
            $(".slide_up_login").slideUp('slow');
            loginFormVisible = false;
        });
        $("#sampleQA").click(function () {
            if($(this).hasClass('opened')) {
                $(this).removeClass('opened');
            } else {
                $(this).addClass('opened');
            }

            $("#tryOut").slideToggle('slow');
        });
        $(".button_to_top").click(function () {
            $("html, body").animate({scrollTop: 0}, "slow");
        });

        $('.main-menu__navigation-menu a.linked').on('click', function (e) {
            e.preventDefault();
            $('.main-menu__navigation-menu li').removeClass('active');
            $(this).parent().addClass('active');
            var a_offset = $(this).data('offset');
            var offset = loginFormVisible ? -(a_offset + 100) : -(a_offset);
            $.scrollTo($(this).attr('href'), 500, {offset: {top: offset}});
        });

        

        $('#terms button').on('click', function () {
            $('.container_terms button').css('opacity', 0);
            $('.gradient').css('opacity', 0);
            $('.terms_shell').animate({
                height: $(".terms_shell").get(0).scrollHeight
            }, 500, function () {
            });
        });



        //function onScroll(event) {
        //    var scrollPos = $(document).scrollTop();
        //    var offset = loginFornVisible ? 300 : 200;
        //    $('.head-menu a.linked').each(function () {
        //        var currLink = $(this);
        //        var refElement = $(currLink.attr("data-href"));
        //        if ((refElement.position().top - offset) <= scrollPos && (refElement.position().top - offset) + refElement.height() > scrollPos) {
        //            $('.head-menu li').removeClass("active");
        //            currLink.parent().addClass("active");
        //        }
        //        else {
        //            currLink.parent().removeClass("active");
        //        }
        //    });
        //}

    });
})(jQuery);