var g_tolerance = 1.0e-2, g_toggle_duration = 400;
var g_name = "";
var g_time_stamps = [];

$(document).ready(function () {
    // show / hide dependent on login
    if (sessionStorage.login == undefined) {
        alert('학습을 시작하려면 먼저 로그인하세요.'); return;
    }
    else {
        if (sessionStorage.login == "administrator") { // for instructor
            // disable input and submit button
            $('.input_name').prop("disabled", true);
            $('.submit_name').prop("disabled", true);

            // show all hiddens
            $('h3:hidden').slideToggle(g_toggle_duration);
            $('ul:hidden').slideToggle(g_toggle_duration);
            $('.submit_eval').val("목차로 가기");
            setTimeout(function () {
                $('.submit_eval').slideToggle(g_toggle_duration);
            }, g_toggle_duration * 7);
        }
    }
    toggle_body(true);

    // show / hide test
    $(".li_test").click(function () {
        // get the test element
        var test = $(this).parent().children().eq(1);
        test.slideToggle(g_toggle_duration); // hide -> show or show -> hide
        return false;
    });

    // for ENTER, click submit name button
    $('body').on('keyup', '.input_name', function (event) {
        if (event.keyCode == 13)
            $(this).nextAll(".submit_name:first").click();
    });

    // for ENTER, click submit quiz button
    $('body').on('keyup', '.input_quiz', function (event) {
        if (event.keyCode == 13)
            $(this).nextAll(".submit_quiz:first").click();
    });

    // show / hide next part
    $(".submit_name").click(function () {
        g_name = $('.input_name').val().trim();
        if (g_name == "") {
            $('.input_name').val("");
            $('.input_name').focus();
            return;
        }
        g_time_stamps.push(Date.now());
        $(this).parent().next().next().children('h3:first').slideToggle(g_toggle_duration);
        $(this).parent().next().next().children('ul:first').slideToggle(g_toggle_duration);
        $('.submit_eval').slideToggle(g_toggle_duration);
        $('.input_name').prop("disabled", true); // disable input button
        $('.submit_name').prop("disabled", true); // disable submit button
    });

    // show / hide each quiz
    $(".submit_quiz").click(function () {
        // get id of the corresponding elements
        var m_input = $(this).prevAll('input:first');
        var m_submit = $(this);
        var m_span = $(this).next();

        // get answer and input value
        var m_answer = m_submit.attr('answer');
        var m_input_val = m_input.val(); // if 'tyoe = numberic, non-number can be input but m_input_val would be undefined

        // in case of no input
        if (m_input_val == "") {
            m_input.focus();
            m_span.text("답을 입력하세요!");
            if (sessionStorage.login == "administrator") { // for instructor
                m_input.val(m_answer); // set answer
                add_hint(m_span, m_submit); // add tooltip hint
            }
            return false;
        }

        // comparison
        var m_tolerance = m_submit.attr('tolerance');
        var m_comparison = compare_value(m_input, m_answer, m_input_val, m_tolerance);

        //if (compare_value(m_input, m_answer, m_input_val)) { //  in case of exact answer
        if (m_comparison) { //  in case of exact answer
            m_input.val(m_answer);
            m_input.prop("disabled", true); // disable input button
            m_input.css("color", "#ff6f6f"); // change the color of input button
            m_submit.prop("disabled", true); // disable submit button
            m_submit.css("background-color", "#ff6f6f"); // change the color of submit button
            m_submit.css("cursor", "default"); // change the color of submit button
            m_span.text("정답입니다!"); // change the text of submit span
            m_span.css("color", "#ff6f6f"); // change the color of submit span
            m_submit.parent().prev('a.li_test').text("확인 질문 - 풀이 완료"); // in case of no a.li_test, no problem

            // remove tooltip hint
            m_span.children(":first").remove();
            return true;
        }
        else { // in case of wrong answer
            m_input.val("");
            m_input.focus();
            m_span.text("오답입니다! 다시 풀어보세요!"); // default message in case of no hint
            if (sessionStorage.login == "administrator") m_input.val(m_answer); // for instructor

            // add tooltip hint
            add_hint(m_span, m_submit);
            return false;
        }
    });

    // show / hide next part or send email and go to back
    $('.submit_eval').click(function () {
        // for instructor
        if (sessionStorage.login == "administrator") {
            window.history.back(); // same to window.history.history.go(-1)
            return;
        }

        if ($('.submit_eval').val() == "다음 단계로") {
            // get the related elements
            var m_span_eval = $(this).next().next();
            var m_cur_ul = $('ul:visible').last();
            var m_spans = m_cur_ul.children().children('.span_quiz');

            // check for each quiz
            for (i = 0; i < m_spans.length; i++) {
                var m_text = $(m_spans[i]).text();
                if (m_text != "정답입니다!") {
                    m_span_eval.text("모든 문제를 풀어야 다음 단계를 볼 수 있습니다!"); return;
                }
            }

            // all quizzes are answered
            var before = g_time_stamps[g_time_stamps.length - 1];
            var present = Date.now();
            var time_diff = present - before;
            if (time_diff < (1 * 60 * 1000)) { // 1 min = 60 sec = 60 * 1000 ms
                m_span_eval.text(time_diff / 1000 + "초 동안의 학습은 충분하지 안습니다. 충분한 시간동안 학습하세요!");
            }
            else {
                g_time_stamps.push(present);
                m_span_eval.text("");
                if ($('ul:hidden').length > 0) $(m_cur_ul).nextAll(':lt(2)').slideToggle(g_toggle_duration);
                else $('.submit_eval').val("학습결과 제출");
            }
        }
        else {
            var m_title = 'numerical analysis - ' + $(document).find("title").text();
            var m_body = $('.input_name').val() + ";"; // name
            for (i = 0; i < g_time_stamps.length; i++) { // time stamps
                m_body += g_time_stamps[i] + ";";
            }

            //window.location.href = 'mailto:ironbell@kyungnam.ac.kr?subject=' + m_title + '&body=' + m_body;
            var m_title = 'numerical analysis - ' + $(document).find("title").text();
            m_popup = window.open('', 'Popup Name', 'fullscreen=no, width=500, height=400, left=100, top=100');
            m_popup.document.write('<span>받는사람 : ironbell@kyungnam.ac.kr</span><br /><br /><span>제목 : ' + m_title + '</span><br /><br /><span>본문 : ' + m_body + '</span>');

            window.history.back(); // same to window.history.history.go(-1)
        }
    });
});

function add_hint(p_span_mom, p_submit) {
    var m_span_hint = p_span_mom.children('.tooltiptext');
    if (m_span_hint.length > 0) return; // hint is already added

    var m_hint = p_submit.attr('hint');
    if (m_hint != undefined) {
        p_span_mom.append('<span class="tooltiptext">' + m_hint + '</span>');
        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    }
}

function compare_value(p_input, p_ex_ans, p_in_ans, p_tolerance) {
    var m_tolerance = g_tolerance;
    if (p_input.prop('type') == "number") { // in case of number
        if (p_tolerance != undefined) m_tolerance = parseFloat(p_tolerance); // set tolerance
        m_ex_ans = parseFloat(p_ex_ans);
        m_in_ans = Math.round(parseFloat(p_in_ans) / m_tolerance) * m_tolerance; // set decimal place
        if (Math.abs(m_ex_ans - m_in_ans) < m_tolerance) return true;
        else return false;
    }
    else { // in case of text
        if (p_ex_ans == p_in_ans) return true;
        else return false;
    }
}

function get_num_exac_quiz() {
    var m_exact_num = 0;
    $(".ol_quiz span.span_quiz").each(function () {
        if ($(this).text() == "정답입니다!") {
            m_exact_num = m_exact_num + 1;
        }
    });
    return m_exact_num;
}
