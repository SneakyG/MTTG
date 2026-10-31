# 2. Kiến trúc project và thứ tự chạy

## 2.1. Đây là project kiểu gì?

Đây là web app tĩnh:

- HTML tạo khung trang.
- CSS định dạng giao diện.
- JavaScript chạy trong browser.
- Google Drive là nơi lưu file ảnh/video và cấu trúc thư mục.
- GitHub Actions có thể dựng cấu hình triển khai rồi xuất bản app lên GitHub Pages.

Không có backend riêng, database riêng, npm build hay framework trong source hiện tại.

## 2.2. Sơ đồ trách nhiệm

| File | Vai trò |
|---|---|
| [index.html](../index.html) | Khung DOM, CSS, font và thứ tự nạp script. |
| [js/env.js](../js/env.js) | Cấu hình môi trường thật; file riêng, không dùng làm tài liệu công khai. |
| [js/env.example.js](../js/env.example.js) | Mẫu cấu hình để chạy tại máy. |
| [js/config.js](../js/config.js) | Tên hai người, giai đoạn hiện tại, ngày bắt đầu và sự kiện. |
| [js/utils.js](../js/utils.js) | Hàm dùng chung, hằng số, cấu hình API và trạng thái toàn cục. |
| [js/drive.js](../js/drive.js) | Truy vấn Drive, chuẩn hóa file, dựng stages và cache. |
| [js/milestones.js](../js/milestones.js) | Tính chênh lệch ngày và các mốc sắp tới. |
| [js/views.js](../js/views.js) | Tạo HTML cho ba màn hình. |
| [js/lightbox.js](../js/lightbox.js) | Mở, đóng và chuyển ảnh/video toàn màn hình. |
| [js/main.js](../js/main.js) | Render, bắt click, gọi `load()` và xử lý lỗi tải. |
| [css/style.css](../css/style.css) | Màu, bố cục, responsive và trạng thái lightbox. |
| [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) | Tạo `env.js` từ GitHub Secrets và deploy. |

## 2.3. Vì sao thứ tự script quan trọng?

Ở cuối [index.html](../index.html), các script có `defer`. Browser tải chúng trong lúc phân tích HTML, nhưng thực thi sau khi HTML được phân tích xong và vẫn giữ thứ tự khai báo:

```text
env.js → config.js → utils.js → drive.js
       → milestones.js → views.js → lightbox.js → main.js
```

Thứ tự này là phụ thuộc:

- `config.js` đọc `window.ENV` do `env.js` tạo.
- `utils.js` tạo `CFG`, `X`, `API`, `U`, `ST` và các helper dùng chung.
- `drive.js` cần `CFG`, `FO`, `X`, `DEF`, `ST`.
- `views.js` cần `X`, `CFG`, các helper và hàm mốc thời gian.
- `lightbox.js` cần phần tử `#lb` và `ACT` được dùng ở thời điểm nhấn Escape.
- `main.js` khởi tạo render và gọi `load`.

Nếu chuyển `main.js` lên trước `views.js`, app có thể chạy khi `V` chưa tồn tại.

## 2.4. Phạm vi toàn cục thay cho module

Các file JS không có `import` hoặc `export`. Chúng là **classic scripts**, cùng dùng phạm vi toàn cục của trang:

```js
let X = { items: [], stages: [] };
const ACT = { ... };
```

Do đó file sau có thể dùng tên được định nghĩa bởi file trước. Đây là cách đơn giản, nhưng có sự phụ thuộc vào thứ tự nạp và tên toàn cục; khi thêm tính năng hãy kiểm tra tên không đè lên tên khác.

## 2.5. Luồng khởi động end-to-end

1. Browser đọc HTML và tạo `#app`, `#nav`, `#lb`.
2. Các JS chạy theo thứ tự `defer`.
3. `config.js` hợp nhất `window.ENV` với cài đặt app thành `CFG`.
4. `utils.js` tạo trạng thái mặc định, ví dụ `X.items=[]`.
5. Khi thực thi `drive.js`, phần cuối thử đọc cache `localStorage.mttg`; nếu có thì gọi `build` để dựng lại `X`.
6. `main.js` chạy `render()` lần đầu.
7. Nếu `CFG.key` và `CFG.root` có giá trị, `main.js` gọi `load()` bất đồng bộ.
8. Khi `load()` hoàn tất, `.finally(render)` vẽ lại giao diện với dữ liệu mới.
9. Nếu tải lỗi, `.catch(...)` lưu thông báo vào `err`; `finally` vẫn render để hiện thông báo.

Vì cache được đọc trước lần render đầu, app có thể có dữ liệu cũ để vẽ trong khi lần tải mới đang chạy. Cache không có ngày hết hạn trong implementation hiện tại.

## 2.6. Render và trạng thái

Các giá trị trạng thái chính:

- `CFG`: cấu hình không thay đổi thường xuyên.
- `X`: dữ liệu chuẩn hóa (`items` và `stages`).
- `AV`: ID ảnh đại diện.
- `tab`: màn hình đang mở (`home`, `mem`, `road`).
- `F`: bộ lọc màn hình kỷ niệm.
- `R`: danh sách tạm để click thumbnail biết nó thuộc nhóm ảnh nào.
- `LB`: danh sách và vị trí ảnh/video trong lightbox.
- `err`: thông báo lỗi tải Drive.

`render()` trong `main.js`:

1. Xóa `R` cũ, vì mỗi lần render sẽ tạo lại HTML và nhóm thumbnail.
2. Kiểm tra cấu hình API.
3. Chọn HTML từ `V[tab]()` hoặc thông báo lỗi/đang tải.
4. Gán HTML vào `#app`.
5. Tạo thanh điều hướng trong `#nav`.
6. Cập nhật đồng hồ nếu `#hms` đang hiện.

Render ở đây không phải framework virtual DOM. Đây là tạo chuỗi HTML rồi gán thẳng bằng `innerHTML`.

## 2.7. Cấu trúc thư mục Drive

Một cấu trúc phù hợp với cách đọc hiện tại:

```text
Thư mục gốc
├── 1_tim_hieu
│   ├── images
│   │   └── 20240214_Valentine đầu tiên
│   │       └── ảnh.jpg
│   └── videos
│       └── 20240214_Valentine đầu tiên
│           └── video.mp4
├── 2_nguoi_yeu
│   └── ...
└── avatar
    └── MTrieu.jpg
```

`drive.js` dựa vào các cấp thư mục và tên thư mục, chứ không dựa vào tên `images`/`videos` để xác định loại media. Loại ảnh/video được lấy từ MIME type của file. Các folder ngay dưới folder giai đoạn được xem như folder trung gian; folder con mang tên bắt đầu bằng `YYYYMMDD` được xem như folder ngày.

## 2.8. Cấu hình và deploy

- [js/config.js](../js/config.js) chứa cấu hình hiển thị như `a`, `b`, `current`, `start`, `events`.
- `window.ENV` cung cấp `key` và `root`, được hợp nhất vào `CFG`.
- Workflow [deploy.yml](../.github/workflows/deploy.yml) lấy `DRIVE_API_KEY` và `DRIVE_ROOT_ID` từ repository secrets, ghi ra `js/env.js`, sau đó deploy thư mục project.
- API key đưa vào JavaScript phía browser không thể giữ bí mật với người tải trang. Hãy giới hạn API key theo referrer/domain và chỉ bật API cần thiết.

## 2.9. Khi thay đổi kiến trúc

Trước khi tạo file mới, hãy hỏi:

1. Logic này có thuộc đúng file hiện có không?
2. File mới cần được nạp ở vị trí nào trong `index.html`?
3. Nó dùng biến toàn cục nào và file nào tạo các biến đó?
4. Sau thay đổi, action nào gọi lại `render()`?
5. Có cần cập nhật hướng dẫn trong [README.md](../README.md) hoặc bộ docs này không?
