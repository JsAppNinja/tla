(function($){
    $(function(){

        $(document).on('click', '#user-type-menu li a', function(e){
            var userType = $(this).text();
            $('#active-user-type').text(userType);
            if (userType == 'Student') {
                $('.uform').addClass('hidden');
                $('.student-form').removeClass('hidden');
            }

            if (userType == 'Teacher') {
                $('.uform').addClass('hidden');
                $('.teacher-form').removeClass('hidden');
            }
        });

        $(document).on('click', '#sex-menu li a', function(e){
            var sex = $(this).text();
            $('#active-sex').text(sex);
            if (sex == 'Female') {
                $('#usersignupform-sex').val(0);
            } else {
                $('#usersignupform-sex').val(1);
            }

        });

        $(document).on('click', '#subjectElementsTab a', function () {
            $(this).parent('li').siblings().removeClass('active');
            $(this).parent('li').addClass('active');
        });

        $(document).on('click', '.answer-list-item', function (e) {
        });

        function openfileDialog() {
            $("#fileLoader").click();
        }
    })
})(jQuery);