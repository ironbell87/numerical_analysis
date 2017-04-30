var id_arr = ["student", "administrator"];  // as many as you like - no comma after final entry
var kw_arr = ["tom_waits", "shine_a_light"];  // as many as you like - no comma after final entry
var time_out_duration = 1500; // 1.5s

$(document).ready(function () {
    // get login id from sesseionStorage
    if (sessionStorage.login != undefined) {
        $(".header_span_login").text(sessionStorage.login);
        toggle_body(true);
    }
    else {
        toggle_body(false);
    }

    // prohibit context menu, drag, and select for normal user
    // <body oncontextmenu='return false' onselectstart='return false' ondragstart='return false'>
    $('body').on('contextmenu', function () {
        if (sessionStorage.login != "administrator") return false;
    });
    $('body').on('drag', function () {
        if (sessionStorage.login != "administrator") return false;
    });
    $('body').on('selectstart', function () {
        if (sessionStorage.login != "administrator") return false;
    });

    // show dialog box for login
    $('.anchor_login').click(function () {
        $('.header_login').trigger('click');
        return false; // stop propagation or double trigger
    });
    $('.header_login').click(function () {
        // already logged in
        if (sessionStorage.login != undefined) {
            var yes_no = confirm("이미 로그인되어 있습니다. 로그아웃하겠습니까?");

            // logout
            if (yes_no == true) {
                // delete session storage
                sessionStorage.removeItem("login");

                // initialize element for login
                $("#input_login").val("");
                $("#span_login").text("");
                $(".header_span_login").text("");
                toggle_body(false);
            }
            return;
        }

        // show login dialog
        append_login();
    });

    // for ENTER, click submit button
    $('body').on('keyup', '#input_login', function (event) {
        if (event.keyCode == 13) $("#submit_login").click();
    });

    // login
    $('body').on('click', '#submit_login', function (event) {
        // get input keyword
        var m_input = $("#input_login");
        var kw = m_input.val();

        // login success / fail
        for (var i = 0; i < kw_arr.length; i++) {
            if (kw == kw_arr[i]) { // in case of success
                sessionStorage.login = id_arr[i]; // "로그인: OK";
                $("#span_login").text(sessionStorage.login);
                $(".header_span_login").text(sessionStorage.login);
                $("#login_outer").fadeOut(time_out_duration / 3);
                toggle_body(true);
                return;
            }
        }

        // in case of fail
        $("#span_login").text("다시 시도하세요!");
        m_input.val("");
        m_input.focus();
    });
});

function append_login() {
    // add empty login div at the end of body
    $("#login_outer").remove();
    $("body").append("<div id='login_outer' hidden></div>");
    $("#login_outer").append("<div id='login_inner'></div>");

    // fill login div
    var login_kw = "<input type='password' id='input_login' placeholder='키워드를 입력하세요' autofocus/>"; // content for modal
    var login_sm = "<input type='submit' id='submit_login' value='로그인'/><br />";
    var login_sp = "<span id='span_login'></span>";
    var login_html = login_kw + login_sm + login_sp;
    $("#login_inner").html(login_html);

    // show login dialog box
    $("#login_outer").fadeIn(time_out_duration);
}

function toggle_body(p_toggle) {
    if (p_toggle == true) { // show
        $(".study_list_wrapper").slideDown(time_out_duration / 3);
        $('#pre_view').slideDown(time_out_duration / 3);
        $('#main_view').slideDown(time_out_duration);
        $('#re_view_quiz').slideDown(time_out_duration);
    }
    else { // hide
        $(".study_list_wrapper").slideUp(time_out_duration / 3);
        $('#pre_view').slideUp(time_out_duration / 3);
        $('#main_view').slideUp(time_out_duration);
        $('#re_view_quiz').slideUp(time_out_duration);
    }
}
