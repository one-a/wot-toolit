var servo = $('#servo');
var num = 0;
var direction = 'up';
var timerId = '';

function ledRandom() {
    var i = 0;
    $txt = $('#led');
    $txt.html('colors');
    $txt.css('color', 'hsl(209, 50%, 50%)');

    function loop(i) {
        if (i > 360) {
            i = 0;
        }
        var color = "hsl(" + i + ", 50%, 50%)";
        $txt.html(color);
        $txt.css('color', color);
        // i++;
        i += 4;
        timerId = setTimeout(loop, 20, i);
    }
    loop(i);
}

function clearTimer() {
    clearTimeout(timerId);
}
$('#color').on('change', function() {
    console.log($(this).val());
});
$('#btn-ledRandom').on('click', function() {
    ledRandom();
    return false;
});
$('#btn-ledPicker').on('click', function() {
    clearTimer();
    return false;
});
$('#btn-rotateR').on('click', function() {
    rotateRight();
    return false;
});
$('#btn-rotateL').on('click', function() {
    rotateLeft();
    return false;
});
$('#btn-rotateAuto').on('click', function() {
    rotateAuto();
    return false;
});
var intarval = '';

function rotateRight() {
    clearAuto();
    rotateServo(180);
}

function rotateLeft() {
    clearAuto();
    rotateServo(0);
}

function rotateAuto() {
    intarval = setInterval(function() {
        if (direction == 'up') {
            num = 180;
        } else {
            num = 0;
        }
        if (num >= 180) {
            direction = 'down';
        } else {
            direction = 'up';
        }
        rotateServo(num);
    }, 1000);
}

function clearAuto() {
    clearInterval(intarval);
}

function rotateServo(num) {
    servo.css('transform', 'rotate(' + num + 'deg)');
}
