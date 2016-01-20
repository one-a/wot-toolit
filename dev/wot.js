    onload = function() {
        draw();
    };

    function draw() {
        var canvas = document.getElementById('c1');
        if (!canvas || !canvas.getContext) {
            return false;
        }
        var ctx = canvas.getContext('2d');
        ctx.beginPath();
        /* グラデーション領域をセット */
        var grad = ctx.createLinearGradient(0, 0, 140, 140);
        /* グラデーション終点のオフセットと色をセット */
        grad.addColorStop(0, 'rgb(192, 80, 77)'); // 赤
        grad.addColorStop(0.5, 'rgb(155, 187, 89)'); // 緑
        grad.addColorStop(1, 'rgb(128, 100, 162)'); // 紫
        /* グラデーションをfillStyleプロパティにセット */
        ctx.fillStyle = grad;
        /* 矩形を描画 */
        ctx.rect(0, 0, 140, 140);
        ctx.fill();
    }

    function img2canvas() {
        var img1 = document.getElementById('img1');
        var img = new Image();
        img.src = img1.src;
        var canvas = document.getElementById('c1');
        if (canvas.getContext) {
            var context = canvas.getContext('2d');
            context.drawImage(img, 0, 0);
            context.save();
        }
    }

    function canvas2img() {
        var img2 = document.getElementById('img2');
        try {
            var canvas = document.getElementById('c1');
            var img_png_src = canvas.toDataURL();
            img2.src = img_png_src;
            document.getEleme
        } catch (e) {
            console.log(e.toString());
        }
    }

    function canvas2base64() {
        var b64area = document.getElementById('txtarea');
        var canvas = document.getElementById('c1');
        //b64area.innerText = canvas.toDataURL('image/png').replace(new RegExp('^data\:[^\;]*\;base64\,'), '');
        b64area.innerText = canvas.toDataURL('image/png');
    }
