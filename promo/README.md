# 奶蛙之塔 6.0 宣传片

- `naiwa-tower-6.0-trailer.mp4`：30 秒横屏，1920×1080，30 帧，配乐是游戏里的塔顶曲
- `trailer-cover.jpg`：封面帧
- `source/trailer.html`：宣传片的画面，每一帧都由 `renderAt(t)` 按时间画出来
- `source/render.js`：逐帧截图的脚本（需要 Playwright；素材放在同一个文件夹下的 web/ 里）

做法参考了 mg-styles-15 的思路：网页逐帧渲染 + ffmpeg 合成。素材全部来自游戏本身。
