# 5. Tự sửa, kiểm tra và luyện tập

## 5.1. Quy trình debug an toàn

### Bước 1 — xác định lớp lỗi

Phân loại trước khi sửa:

1. **Không có giao diện:** lỗi HTML, thứ tự script hoặc lỗi JavaScript lúc khởi động.
2. **Hiện “Cần cấu hình”:** thiếu `CFG.key` hoặc `CFG.root`.
3. **Có giao diện nhưng trống:** API lỗi, thư mục rỗng, cấu trúc tên sai hoặc cache cũ.
4. **Có ô nhưng ảnh lỗi:** API đã liệt kê metadata, nhưng URL thumbnail/quyền truy cập file có thể lỗi.
5. **Chỉ một thao tác lỗi:** kiểm tra `data-a`, `ACT`, state và index trong `R`.
6. **Ngày/mốc sai:** kiểm tra timezone, chuỗi ngày, `CFG.start` và thuật toán ngày.

### Bước 2 — xem Console

DevTools → Console:

- Đọc lỗi đầu tiên; lỗi tiếp theo có thể chỉ là hệ quả.
- Ghi lại file và số dòng.
- Không chụp hoặc gửi API key trong URL request.
- Kiểm tra lỗi cú pháp trước lỗi logic.

### Bước 3 — xem Network

DevTools → Network:

- Lọc `drive/v3/files` để kiểm tra API list.
- Xem status code, query, JSON trả về và trường `error.message`.
- Tìm request thumbnail riêng để xác định lỗi hiển thị ảnh.
- Kiểm tra request có bị chặn do CORS/referrer/key restriction hay không.

Mở file bằng `file://` có thể tạo referrer rỗng. Với API key giới hạn HTTP referrer, hãy chạy qua máy chủ HTTP local hoặc môi trường deploy đã được cho phép.

### Bước 4 — kiểm tra cây Drive

Đối chiếu quy ước mà `drive.js` đọc:

```text
root
└── 2_nguoi_yeu
    └── images
        └── 20261025_Chu thich
            └── photo.jpg
```

- Folder stage khớp `số_slug`.
- Folder ngày bắt đầu bằng `YYYYMMDD`.
- Media nằm bên trong folder ngày.
- MIME type của file là `image/...` hoặc `video/...`.
- Folder gốc được chia sẻ theo cách mà API key/người xem được phép đọc.

### Bước 5 — loại trừ cache

Trong DevTools → Application → Local Storage, xóa key `mttg`, sau đó tải lại trang. Đây là cách phân biệt lỗi dữ liệu mới với dữ liệu cũ đang được cache.

## 5.2. Checklist sau khi sửa code

- Không làm sai thứ tự script trong [index.html](../index.html).
- Dữ liệu item vẫn có `id`, `d`, `s`, `v`, `c` hoặc cập nhật tất cả nơi đang đọc các trường này.
- Nếu đổi schema cache, xử lý cache cũ hoặc tăng phiên bản cache.
- Mọi phần tử tương tác có `data-a` hợp lệ.
- Render lại không làm thumbnail trỏ nhầm list trong `R`.
- API lỗi được biểu diễn rõ ở UI hoặc log phù hợp; tránh `catch` rỗng cho luồng lỗi chính.
- Không đưa key thật hoặc ID riêng tư vào docs, commit hay ảnh chụp.
- Kiểm tra cả trường hợp dữ liệu rỗng, chỉ có ảnh, chỉ có video và không có avatar.

## 5.3. Bài tập đọc hiểu

### Bài 1 — trace một file

Cho file Drive:

```text
Tên: IMG_01.jpg
MIME type: image/jpeg
Parent folder: 20261025_Anniversary
```

Nó nằm dưới folder trung gian thuộc stage số 2.

Hãy tự trả lời:

1. `dm` có record nào cho folder ngày?
2. `isMedia` trả về gì?
3. `v` của item bằng bao nhiêu?
4. Item được thêm vào vị trí nào trong `X.items` sau sắp xếp ngày?

**Gợi ý đáp án:** `dm` map ngày thành `2026-10-25`, stage `2`, caption `Anniversary`; MIME type hợp lệ; `v=0`; item được sắp theo ngày giảm dần cùng các item khác.

### Bài 2 — giải thích filter

Với `F.t='i'`, giải thích vì sao video bị loại:

```js
(F.t == 'v') == !!x.v
```

**Đáp án:** bên trái là `false`; ảnh có `!!x.v=false` nên được giữ; video có `true` nên không bằng `false`.

### Bài 3 — sửa tên folder

Tên nào khớp regex giai đoạn `^(\d+)_(.+)$`?

- `2_nguoi_yeu`
- `02-nguoi-yeu`
- `yeu_nhau`

**Đáp án:** chỉ `2_nguoi_yeu`.

### Bài 4 — dự đoán retry

Nếu API gặp rate limit ở cả ba lần thử đầu rồi thành công ở lần kế tiếp, các khoảng chờ là bao nhiêu?

**Đáp án:** 600ms, 1200ms, 1800ms. Tổng cộng bốn lần gọi. Gọi đây là exponential backoff là không chính xác vì thời gian không nhân đôi.

### Bài 5 — thay đổi quy ước caption

Muốn chấp nhận caption kể cả khi chỉ có emoji, hãy tìm điều kiện lọc caption trong `drive.js`. Trước khi sửa, quyết định rõ:

- Có bỏ dấu phân cách đầu caption không?
- Nếu caption rỗng thì lưu `''`, `undefined` hay `null`?
- View có cần escape caption bằng `E(...)` không?

## 5.4. Bài tập thực hành tăng dần

1. Thêm một `CFG.events` và xem `ups` đưa sự kiện vào danh sách nào.
2. Đổi tên stage hiện tại trong folder Drive để quan sát slug và metadata `ST`.
3. Thêm một folder ngày có caption, kiểm tra caption tại nhóm kỷ niệm.
4. Thêm log tạm trước và sau `build(sf, it)` để so sánh dữ liệu thô với dữ liệu chuẩn hóa.
5. Chuyển một arrow callback thành vòng `for...of` tương đương, rồi so sánh đầu ra.
6. Thêm một thông tin vào item; tìm toàn bộ nơi item được tạo, cache, hiển thị và mở trong lightbox để cập nhật đồng bộ.

## 5.5. Từ khóa để tra cứu thêm

- JavaScript: lexical scope, truthy/falsy, array methods, destructuring, template literals.
- Web: DOM, event bubbling, event delegation, `innerHTML`.
- Async: Promise, `async`/`await`, `Promise.all`, retry/backoff.
- HTTP: status code, query string, pagination, API key restrictions.
- Google Drive API: files list, MIME type, parent folder, sharing permissions.
- Ngày tháng: local time, UTC, daylight saving time, leap year.
- CSS: grid, flexbox, media query, CSS custom properties.
