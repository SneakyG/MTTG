# Bộ tài liệu học source Our Love Story

Bộ tài liệu này dành cho người muốn học JavaScript bằng cách đọc một project thật. App không dùng framework hay bước biên dịch: trình duyệt tải các file HTML, CSS và JavaScript trực tiếp.

## Lộ trình đề xuất

1. [Nền tảng JavaScript trong project](01-javascript-foundations.md) — cú pháp và khái niệm cần nhận ra khi đọc source.
2. [Kiến trúc và thứ tự chạy](02-project-architecture.md) — trách nhiệm từng file, cách các file kết nối và khởi động app.
3. [Dữ liệu Google Drive](03-drive-data-pipeline.md) — đọc sâu `js/drive.js`, từ API đến dữ liệu kỷ niệm.
4. [Giao diện, trạng thái và ngày tháng](04-ui-state-and-dates.md) — cách render các màn hình, lọc dữ liệu và xử lý tương tác.
5. [Tự sửa, kiểm tra và luyện tập](05-debugging-and-exercises.md) — cách lần lỗi và bài tập nhỏ để củng cố kiến thức.

Nên mở project cạnh tài liệu. Đọc phần giải thích trước, sau đó mở file được liên kết và lần lượt đối chiếu các hàm. JavaScript hiện được viết khá cô đọng; khi học, hãy tự xuống dòng và đặt tên tạm cho từng bước để nhìn rõ dữ liệu đi qua đâu.

## Bức tranh nhanh

```text
Google Drive API
       │ js/drive.js: đọc cây thư mục, chuẩn hóa dữ liệu, tạo cache
       ▼
X.items ───── X.stages ───── AV
       │
       ├── js/views.js: tạo HTML cho home / mem / road
       ├── js/main.js: chèn HTML, bắt sự kiện, khởi động load()
       └── js/lightbox.js: mở ảnh hoặc video của mục được chọn
```

`X`, `AV`, `CFG`, `F`, `R`, `LB` và các hàm dùng chung được khai báo ở phạm vi toàn trang. Các file JavaScript không dùng `import`/`export`; chúng là các script cổ điển được nạp theo thứ tự trong [index.html](../index.html).

## Từ điển ngắn

| Từ | Ý nghĩa trong project |
|---|---|
| API | Giao diện để app gửi yêu cầu và nhận dữ liệu từ Google Drive. |
| `id` | Mã định danh của file hoặc thư mục trên Drive. |
| MIME type | Chuỗi cho biết loại nội dung, ví dụ `image/jpeg` hoặc `video/mp4`. |
| Promise | Đại diện cho kết quả bất đồng bộ sẽ có trong tương lai. |
| `async` / `await` | Cú pháp giúp viết luồng Promise theo thứ tự dễ đọc hơn. |
| Render | Tạo HTML từ trạng thái hiện tại rồi cập nhật DOM. |
| DOM | Mô hình các phần tử HTML mà JavaScript có thể đọc và thay đổi. |
| Cache | Bản dữ liệu lưu tạm trong `localStorage` để dùng lại khi mở trang. |
| Giai đoạn (`stage`) | Một chặng như `2_nguoi_yeu`, được gắn với số `s`. |
| Kỷ niệm (`item`) | Một ảnh hoặc video, gồm `id`, ngày `d`, giai đoạn `s`, loại `v` và chú thích `c`. |

## Điểm bắt đầu trong source

- Khung HTML và thứ tự nạp script: [index.html](../index.html)
- Cấu hình có thể chỉnh: [js/config.js](../js/config.js)
- Hàm và trạng thái dùng chung: [js/utils.js](../js/utils.js)
- Luồng tải dữ liệu: [js/drive.js](../js/drive.js)
- Tính mốc thời gian: [js/milestones.js](../js/milestones.js)
- Các màn hình: [js/views.js](../js/views.js)
- Điều khiển giao diện: [js/main.js](../js/main.js)
- Trình xem ảnh/video: [js/lightbox.js](../js/lightbox.js)
- Giao diện trình bày: [css/style.css](../css/style.css)

## Phạm vi và lưu ý khi đọc

- Tài liệu mô tả source hiện có, không giả định project dùng React, TypeScript hay backend.
- `js/env.js` chứa cấu hình triển khai riêng và có thể chứa API key. Không đưa key thật vào tài liệu, ảnh chụp, hoặc commit công khai.
- Phần debug trong trình duyệt thường cần chạy qua HTTP/HTTPS thay vì mở trực tiếp bằng `file://`, vì cấu hình giới hạn API key có thể từ chối request không có referrer.
- Một số tên biến ngắn (`o`, `t`, `sf`, `mf`, `dfs`, `dm`, `fl`, `it`) được giữ để đối chiếu source. Tài liệu sẽ diễn giải ý nghĩa của chúng ở nơi xuất hiện.
