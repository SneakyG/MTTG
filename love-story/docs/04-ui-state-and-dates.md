# 4. Giao diện, trạng thái và logic ngày tháng

## 4.1. Các màn hình trong `views.js`

`V` là object ánh xạ tên màn hình đến hàm tạo HTML:

```js
V.home = () => `...`;
V.mem = () => `...`;
V.road = () => `...`;
```

`main.js` chọn màn hình hiện tại bằng `V[tab]()`. Mỗi hàm đọc trạng thái dùng chung và trả về một chuỗi HTML.

### Trang chủ: `V.home`

Trang chủ:

- Đọc stage hiện tại qua `CFG.current`.
- Chọn ngày bắt đầu từ `stage.st`.
- Gọi `ymd` để tính năm/tháng/ngày.
- Đếm ảnh và clip từ `X.items`.
- Tìm tối đa sáu kỷ niệm vào cùng ngày/tháng của các năm trước.
- Gọi `ups` để lấy tối đa năm mốc tiếp theo.
- Tạo nút mở Drive và nút cập nhật.

`cell(...)` tạo một thumbnail và gắn `data-a=lb` để click mở lightbox. Trước khi tạo thumbnail, danh sách item được đưa vào `R`; HTML giữ chỉ số danh sách bằng `data-l` và vị trí bằng `data-i`.

### Kỷ niệm: `V.mem`

Bộ lọc được lưu trong:

```js
F = { s: 0, t: '' };
```

- `F.s`: stage; `0` nghĩa là tất cả.
- `F.t`: loại; `''` nghĩa là ảnh và clip, `'i'` là ảnh, `'v'` là video.

Hàm lọc kiểm tra stage và loại; sau đó gom kết quả vào object `G` theo ngày. Từng ngày được sắp giảm dần, chia heading theo tháng và dựng grid ảnh/video.

Dòng điều kiện loại có thể đọc như sau:

```js
!F.t || (F.t == 'v') == !!x.v
```

- Không chọn loại (`F.t` rỗng) → nhận mọi loại.
- Chọn video → biểu thức so sánh `true` với cờ `x.v`.
- Chọn ảnh → biểu thức so sánh `false` với cờ `x.v`.

### Hành trình: `V.road`

Mỗi stage được đánh dấu:

- `done`: trước stage hiện tại.
- `cur`: stage hiện tại.
- `next`: stage tương lai.

Mỗi mục hiển thị tối đa bốn ảnh đại diện. Click ảnh vẫn mở lightbox; click nút “Xem kỷ niệm” chuyển sang màn hình `mem` với stage đó được chọn.

## 4.2. `R` — liên kết thumbnail với danh sách item

Trong cùng một lần render, `lst(list)` thêm `list` vào `R` rồi trả về index của list. Mỗi thumbnail có:

```html
data-l="vị trí list trong R"
data-i="vị trí item trong list"
```

Khi click, handler `lb` trong `main.js` đọc:

```js
LB = { l: R[b.dataset.l], i: +b.dataset.i };
```

Như vậy thumbnail không phải nhúng cả object vào HTML; nó chỉ mang hai chỉ số để tìm item trong bộ nhớ.

`render()` đặt `R=[]` trước khi dựng HTML mới. Nếu quên reset hoặc dùng lại markup cũ sau render, các index có thể trỏ sai danh sách.

## 4.3. Event delegation trong `main.js`

Tất cả phần tử tương tác được đánh dấu `data-a`. Một listener trên `document` nhận click:

1. `e.target.closest('[data-a]')` tìm nút/phần tử có action.
2. Đọc `data-a`, `data-k`, `data-i`.
3. Gọi `ACT[action](...)`.

Các action tiêu biểu:

| Action | Tác dụng |
|---|---|
| `go` | Đổi tab và render. |
| `fs` | Đổi stage filter. |
| `ft` | Đổi loại media filter. |
| `sf` | Chọn stage rồi mở màn hình kỷ niệm. |
| `lb` | Mở lightbox item đã click. |
| `lc` | Đóng lightbox. |
| `lp` / `lq` | Chuyển item trước/sau. |
| `dr` | Mở thư mục gốc Drive. |
| `rf` | Tải lại dữ liệu Drive. |

`ACT[b.dataset.a]?.(...)` dùng optional chaining để bỏ qua nếu action không tồn tại, thay vì gọi `undefined`. Khi thêm loại phần tử mới, phải đặt đúng `data-a` và khai báo action tương ứng.

## 4.4. Lightbox

`lightbox.js` giữ trạng thái:

```js
LB = { l: danhSach, i: viTri };
```

- `show()` đọc `LB.l[LB.i]`, dựng nút đóng/nút chuyển và ảnh hoặc iframe video.
- `step(n)` cộng vị trí, dùng modulo để quay vòng ở đầu/cuối danh sách.
- Nút bàn phím mũi tên, Escape và thao tác vuốt gọi các action tương ứng.
- Link “Mở bản gốc” trỏ đến trang file Drive.

Một điểm để kiểm tra khi sửa: nếu không có danh sách item hoặc index không hợp lệ, `show()` kết thúc sớm khi `x` không tồn tại.

## 4.5. Các helper ngày tháng trong `utils.js`

| Helper | Vai trò |
|---|---|
| `P(n)` | Đệm số một chữ số thành hai ký tự. |
| `iso(date)` | Định dạng `Date` thành `YYYY-MM-DD` theo local time. |
| `D(s)` | Chuyển `YYYY-MM-DD` thành `Date` tại nửa đêm local. |
| `fmt(s)` | Hiển thị ngày theo locale tiếng Việt. |
| `dd(a,b)` | Chênh lệch số ngày bằng cách chia millisecond cho `86400000` và làm tròn. |
| `today()` | Tạo ngày hiện tại ở nửa đêm local. |

Dùng `T00:00:00` trong `D` nhằm tránh hiểu chuỗi ngày ISO như UTC rồi đổi ngày theo múi giờ tại máy.

### `ymd(a, b)`: tách chênh lệch thành năm/tháng/ngày

Thuật toán:

1. Lấy hiệu năm, tháng, ngày trên lịch.
2. Nếu hiệu ngày âm, mượn số ngày của tháng trước.
3. Nếu hiệu tháng âm, mượn một năm (12 tháng).
4. Trả `[năm, tháng, ngày]`.

Đây là phép tính theo thành phần lịch, không giống việc chia tổng số ngày cho 365.

### `ups(s, cs)`: tạo danh sách sự kiện sắp tới

Nguồn sự kiện:

- Một danh sách mốc số ngày sau ngày bắt đầu, ví dụ 100, 365, 1000 ngày.
- Mốc kỷ niệm năm gần nhất.
- Các mục cấu hình trong `CFG.events`, lặp hằng năm.

Hàm giữ ngày không trước hôm nay, tính `k` là số ngày còn lại, sắp xếp tăng dần theo ngày và trả tối đa năm sự kiện.

`Date` có quy tắc tự chuẩn hóa ngày không hợp lệ. Ví dụ một số trường hợp 29/02 khi cộng năm có thể chuyển sang ngày/tháng khác; nếu cần chính sách rõ cho năm nhuận thì phải quyết định và kiểm thử riêng.

## 4.6. CSS và responsive

`style.css` dùng CSS variables ở `:root` cho màu. Media query `prefers-color-scheme: dark` đổi bảng màu theo thiết lập hệ điều hành.

Các khái niệm nổi bật:

- `box-sizing: border-box`: width/height bao gồm padding và border.
- `display: grid` + `grid-template-columns`: lưới thumbnail.
- `object-fit: cover`: cắt ảnh để lấp đầy ô.
- `position: fixed`: thanh nav và lightbox bám vào màn hình.
- `aspect-ratio`: giữ tỉ lệ khung ảnh/video.
- `env(safe-area-inset-...)`: tránh vùng tai thỏ/home indicator trên thiết bị di động.
- `prefers-reduced-motion`: bỏ animation khi người dùng yêu cầu giảm chuyển động.

## 4.7. Thêm một hành động giao diện

Ví dụ thêm nút có `data-a="myAction"`:

1. Tạo markup ở hàm view phù hợp.
2. Thêm `myAction` trong object `ACT` ở `main.js`.
3. Xác định dữ liệu cần truyền qua `data-i` hoặc `data-k`.
4. Nếu trạng thái thay đổi, gọi `render()` hoặc cập nhật giao diện theo pattern hiện có.
5. Kiểm tra action khi click vào phần tử con bên trong nút; `closest` giúp click vẫn tìm được action cha.
6. Đảm bảo action không giữ index từ một lần render cũ.
