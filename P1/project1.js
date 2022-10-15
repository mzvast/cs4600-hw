// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite(bgImg, fgImg, fgOpac, fgPos) {
    const bgData = bgImg.data;
    const fgData = fgImg.data;

    // 绘制fg的范围
    const startX = fgPos.x < 0 ? -fgPos.x : 0;
    const endX = Math.min(bgImg.width - fgPos.x, fgImg.width);

    const startY = fgPos.y < 0 ? -fgPos.y : 0;
    const endY = Math.min(bgImg.height - fgPos.y, fgImg.height);

    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            const fgIndex = y * (fgImg.width * 4) + 4 * x;

            // fg的像素经过平移之后绘制到bg的位置
            const targetIndex =
                (y + fgPos.y) * (fgImg.width * 4) + 4 * (x + fgPos.x);
            const fgMixOpac = (fgData[fgIndex + 3] / 255) * fgOpac;

            for (let i = 0; i < 3; i++) {
                bgData[targetIndex + i] =
                    fgData[fgIndex + i] * fgMixOpac +
                    (1 - fgMixOpac) * bgData[targetIndex + i];
            }
        }
    }
}

// inspired by
// https://hakkerbarry.com/