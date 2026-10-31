# 3. Đọc sâu `js/drive.js`: dữ liệu từ Google Drive đến app

Đây là tài liệu lần theo luồng quan trọng nhất của project: đọc cây thư mục Google Drive, biến các file thành records mà giao diện hiểu được.

## 3.1. Mô hình dữ liệu sau khi chuẩn hóa

Một media item trong `X.items` có dạng:

```js
{
  id: 'drive-file-id',
  d: '2026-10-25',
  s: 2,
  v: 0,
  c: 'Valentine đầu tiên'
}
```

| Trường | Ý nghĩa |
|---|---|
| `id` | Drive file ID; dùng để tạo URL thumbnail, preview và trang file. |
| `d` | Ngày dạng ISO `YYYY-MM-DD`. |
| `s` | Số giai đoạn chứa media, ví dụ `2`. |
| `v` | `1` là video; `0` là ảnh. |
| `c` | Caption lấy từ phần mô tả trong tên folder ngày; có thể là chuỗi rỗng. |

Một stage trong `X.stages` có dạng:

```js
{
  n: 2,
  l: 'Người yêu',
  e: '💕',
  v: 'đã yêu nhau',
  st: '2026-08-30',
  last: '2026-10-25',
  np: 12,
  nv: 2
}
```

`AV` chứa ID avatar gán cho hai người. Tên trường `v` hơi khác theo ngữ cảnh: ở item nó là cờ video; ở stage nó là câu trạng thái.

## 3.2. Vai trò các helper

### `ls(q, f)`: gọi API và gom các trang

Tham số:

- `q`: điều kiện tìm kiếm Google Drive, ví dụ `'<folder-id>' in parents`.
- `f`: danh sách field cần API trả về.

Hàm tạo URL theo dạng:

```text
API + q + fields + pageSize + API key + pageToken (nếu có)
```

Chi tiết:

1. `encodeURIComponent(q)` mã hóa query để đưa vào URL.
2. Gửi `fetch(...)`.
3. Đọc JSON bằng `await r.json()`.
4. Nếu HTTP thành công (`r.ok`), thoát vòng retry.
5. Nếu lỗi không giống `rateLimit`, hoặc đã đến ngưỡng retry, ném Error.
6. Nếu lỗi rate limit, chờ rồi thử lại.
7. Nối `j.files` vào `o`.
8. Nếu có `nextPageToken`, gọi tiếp trang kế tiếp.
9. Trả toàn bộ danh sách `o`.

`pageSize=1000` yêu cầu tối đa 1000 file mỗi trang; `nextPageToken` vẫn cần thiết vì kết quả có thể nhiều hơn một trang.

**Lưu ý về tên comment:** khoảng chờ trong code là `600 * (k + 1)`, tức 600ms, 1200ms, 1800ms. Đây là backoff tăng tuyến tính theo số lần thử, không phải exponential backoff đúng nghĩa (mỗi lần nhân đôi).

Vòng `for (let k = 0; ; k++)` bắt đầu từ 0. Điều kiện `k >= 3` có nghĩa tối đa bốn lần gọi tổng cộng: lần đầu và tối đa ba lần thử lại.

### `NF`: loại thư mục khỏi kết quả

```js
const NF =
  " and mimeType!='application/vnd.google-apps.folder' and trashed=false";
```

Đây là phần query được nối sau điều kiện cha để bỏ folder và file trong thùng rác. MIME type của folder trong Drive là `application/vnd.google-apps.folder`.

### `pool(a, fn, n=10)`: giới hạn đồng thời

`pool` chạy tối đa `n` worker:

1. Tạo array kết quả `o`.
2. Mỗi worker lấy index kế tiếp qua biến `i`.
3. Chạy `await fn(a[k])`.
4. Ghi vào `o[k]`, giữ đúng thứ tự đầu vào.
5. `Promise.all` chờ mọi worker hoàn tất.

Khi gọi `pool(ids, ...)`, code không gửi mọi request một lúc; mặc định tối đa 10 worker gọi `lsIn` đồng thời.

### `lsIn(ids, x, f)`: đọc từng folder cha

```js
lsIn(ids, suffix, fields)
```

Với mỗi ID, tạo query `'<id>' in parents` rồi nối `suffix`, gọi `ls`, cuối cùng làm phẳng các kết quả bằng `.flat()`.

Comment nhấn mạnh không gộp nhiều parent vào query `or`, vì key công khai của app có thể bị Drive trả 403.

### `isMedia(f)`: lọc loại file

Regex `/^(image|video)\//` kiểm tra MIME type bắt đầu bằng `image/` hoặc `video/`. Ví dụ:

- `image/jpeg` → hợp lệ.
- `video/mp4` → hợp lệ.
- `application/pdf` → không hợp lệ.

## 3.3. `build(sf, it)`: tạo stages

Đầu vào:

- `sf`: folder giai đoạn đã parse, mỗi mục có `id`, `n`, `slug`.
- `it`: các media item đã chuẩn hóa.

Các bước:

1. Gán `X.items = it`.
2. Tính số stage `N`, ít nhất bằng số stage mặc định `DEF.length`; nếu Drive có stage đánh số cao hơn thì mở rộng đến số đó.
3. Tạo một stage cho mỗi số từ `1` đến `N`.
4. Tìm folder stage có số `n` tương ứng.
5. Dùng slug để tìm metadata trong `ST`; nếu không tìm thấy thì tạo nhãn mặc định từ slug.
6. Lọc `it` theo `s` để lấy media của stage.
7. Dùng ngày bắt đầu cấu hình `CFG.start[n]`; nếu không có thì dùng ngày media sớm nhất.
8. Đếm ảnh (`!x.v`) và video (`x.v`).
9. Gán array kết quả vào `X.stages`.

`build` không gọi API; nó chỉ chuyển dữ liệu thành trạng thái mà UI cần. Vì vậy nó được dùng được cả cho dữ liệu mới lẫn cache.

## 3.4. `load()`: đọc cây thư mục theo từng lớp

### Bước A — đọc folder cấp gốc

```js
const all = await ls(`'${CFG.root}' in parents` + FO, 'id,name');
```

Chỉ lấy `id` và `name`, vì ở bước này cần nhận diện avatar và giai đoạn.

`FO` được định nghĩa trong `utils.js` để chỉ folder chưa bị xóa.

### Bước B — tìm avatar

```js
const av = all.filter(f => /ava/i.test(f.name));
```

Tên folder gốc có chữ “ava” (không phân biệt hoa thường) được xem là folder avatar. Sau đó `pa` đọc folder con và file ảnh. `pa` là Promise được khởi chạy trong lúc các bước khác tiếp tục; kết quả chỉ được lấy bằng `await pa` khi cần gán avatar.

Trong source hiện tại, nhánh avatar có `.catch(() => [])`: lỗi riêng khi tải avatar được biến thành danh sách rỗng; lỗi tải cây kỷ niệm chính vẫn có thể làm `load()` thất bại.

### Bước C — parse folder giai đoạn

```js
const m = /^(\d+)_(.+)$/.exec(f.name);
```

Ví dụ `2_nguoi_yeu` cho:

- `m[1]` = `'2'` → `n = 2`.
- `m[2]` = `'nguoi_yeu'` → `slug`.
- `f.id` vẫn được giữ để query folder con.

Folder không khớp mẫu sẽ bị loại. Tên `2-nguoi-yeu` không khớp vì dấu phân cách bắt buộc là `_`.

### Bước D — đọc folder trung gian và lập ánh xạ stage

`mf` là danh sách folder con trực tiếp của tất cả stage. `by` ánh xạ folder trung gian ID về số stage:

```text
by[folder-trung-gian-id] = stage-number
```

Ví dụ folder `images` nằm trong stage số 2 sẽ được map về `2`.

### Bước E — đọc folder ngày và parse ngày/caption

Tên folder ngày phải bắt đầu bằng:

```text
YYYYMMDD
```

Ví dụ `20240214_Valentine đầu tiên`:

- `m[1]` = năm `2024`
- `m[2]` = tháng `02`
- `m[3]` = ngày `14`
- `m[4]` = phần đuôi `_Valentine đầu tiên`

Phần đầu dấu cách, `_` hoặc `-` bị bỏ khỏi caption. Caption chỉ được giữ nếu có ít nhất một ký tự chữ theo Unicode `\p{L}`.

Thông tin folder ngày lưu vào `dm` theo ID folder:

```js
dm[dateFolderId] = { d: '2024-02-14', s: 2, c: 'Valentine đầu tiên' };
```

**Hạn chế xác thực ngày:** code kiểm tra tháng 1–12 và ngày 1–31, nhưng không xác nhận ngày tồn tại trong lịch. Ví dụ `20240231` vẫn qua điều kiện hiện tại.

### Bước F — lấy media bên trong folder ngày

Tất cả ID trong `dm` được dùng để truy vấn các file con. File được sắp theo tên trước khi thêm vào `it`; chỉ file có MIME type ảnh hoặc video được giữ.

Video được nhận diện bằng ký tự đầu MIME type:

```js
v: f.mimeType[0] == 'v' ? 1 : 0
```

File nhận ngày, stage và caption từ folder cha trong `dm`. Sau đó toàn bộ `it` được sắp theo `d` giảm dần để ngày mới nhất lên trước.

### Bước G — tạo stage và avatar

`build(sf, it)` cập nhật `X`. Danh sách avatar được sắp theo tên; hàm `pk` ưu tiên tên file trùng chính xác tên người sau khi bỏ phần mở rộng. Nếu không tìm thấy thì lấy ảnh theo vị trí 0 hoặc 1.

**Điểm cần lưu ý:** nếu tên avatar không khớp và Drive trả ít hơn hai ảnh, một avatar có thể không có ID; giao diện có fallback hiển thị chữ cái đầu tên.

## 3.5. Sơ đồ dữ liệu qua pipeline

```text
Drive root
  ├─ folders "1_tim_hieu", "2_nguoi_yeu", ...
  │    └─ folders trung gian (images, videos hoặc tên khác)
  │         └─ folders ngày "YYYYMMDD_caption"
  │              └─ file ảnh/video
  └─ folder có tên chứa "ava"
       └─ file ảnh avatar

Google Drive File objects
      │ parse tên + MIME type + parent ID
      ▼
sf: stage folders ──┐
dm: date folders ───┼──> it: [{id,d,s,v,c}, ...]
avatar files ───────┘
      │
      ├── build(sf, it) -> X.items, X.stages
      └── pk(...) -> AV
```

## 3.6. Cache trong `localStorage`

Ở cuối `drive.js`, app thử đọc:

```js
localStorage.mttg
```

Giá trị là chuỗi JSON; `JSON.parse` biến nó lại thành object. Nếu cache có dữ liệu, `build(c.sf, c.it)` dựng `X` trước khi API trả về.

Sau lần tải thành công, `load()` ghi:

```js
JSON.stringify({ sf, it, AV })
```

Các điểm cần biết khi debug:

- Cache có thể khiến giao diện hiển thị dữ liệu cũ trước dữ liệu mới.
- Cache hiện không có phiên bản, timestamp hoặc cơ chế hết hạn.
- Thay cấu trúc record có thể làm cache cũ không còn tương thích; xóa key `mttg` trong DevTools → Application → Local Storage để kiểm tra tải sạch.
- Cả đọc/parse cache và ghi cache đang nằm trong `try/catch` rỗng; lỗi cache không hiện ra UI.
- Cache chỉ chứa dữ liệu metadata và ID, không chứa byte ảnh/video.

## 3.7. Cách lần lỗi Drive

1. Mở DevTools → Network, lọc `drive/v3/files`.
2. Xem request có được gửi không; kiểm tra status code và nội dung JSON lỗi.
3. Nếu request đầu thành công, kiểm tra có `nextPageToken` và request trang kế tiếp hay không.
4. Xác minh `CFG.root` là ID thư mục gốc, không phải URL đầy đủ.
5. Xác minh folder/file được chia sẻ cho đúng đối tượng và Drive API được bật.
6. Kiểm tra cấu trúc folder: root → stage → folder trung gian → folder ngày → media.
7. Kiểm tra tên stage khớp `số_slug`; tên ngày bắt đầu bằng tám chữ số `YYYYMMDD`.
8. Kiểm tra response có các field mà bước sau cần: `id`, `name`, `mimeType`, `parents`.
9. Xóa cache `mttg`, tải lại và so sánh.
10. Phân biệt lỗi API liệt kê file với lỗi tải thumbnail: đây là request khác nhau.

Không chia sẻ API key trong ảnh chụp console hoặc log công khai.
