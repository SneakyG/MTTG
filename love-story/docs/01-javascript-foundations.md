# 1. Nền tảng JavaScript trong project

Tài liệu này giải thích những cú pháp JavaScript người đọc sẽ gặp thường xuyên trong project. Mục tiêu là đọc và lần được dữ liệu, không phải bao quát toàn bộ ngôn ngữ.

## 1.1. JavaScript chạy ở đâu?

Project là web app chạy trong trình duyệt. Trình duyệt cung cấp các đối tượng có sẵn như:

- `document`: tìm và thay đổi phần tử HTML.
- `window`: phạm vi toàn cục của trang; `window.ENV` được dùng để truyền cấu hình triển khai.
- `fetch`: gửi HTTP request đến Google Drive API.
- `localStorage`: lưu dữ liệu dạng chuỗi trên trình duyệt.
- `setInterval`, `setTimeout`: chạy việc theo thời gian.
- `addEventListener`: lắng nghe thao tác người dùng và sự kiện bàn phím/cảm ứng.

Đây là JavaScript phía trình duyệt, không phải Node.js. Do đó source có thể dùng `document` và không cần server riêng để tạo HTML.

## 1.2. Biến: `const` và `let`

```js
const API = 'https://www.googleapis.com/drive/v3/files';
let err = '';
```

- `const` không cho gán biến sang giá trị khác. Nếu giá trị là object/array thì nội dung bên trong vẫn có thể thay đổi.
- `let` cho phép gán lại.
- Project không dùng `var`; khi đọc source mới, ưu tiên giữ quy tắc `const` trước, chỉ dùng `let` khi thật sự cần gán lại.

Ví dụ trong [js/utils.js](../js/utils.js), `X` được khai báo `let` vì các thuộc tính `items` và `stages` được cập nhật khi dữ liệu được tải.

## 1.3. Kiểu dữ liệu thường gặp

### String

```js
const name = 'MTrieu';
```

Chuỗi thường dùng cho tên, ngày, URL, nhãn giao diện và thông báo lỗi. Ngày trong dữ liệu kỷ niệm được chuẩn hóa thành chuỗi `YYYY-MM-DD`.

### Number và ép kiểu

```js
const n = +m[1];
```

Dấu `+` đứng trước chuỗi số là cách ép chuỗi thành number. Trong `drive.js`, regex lấy phần số trong tên thư mục; `+m[1]` chuyển nó thành số giai đoạn.

Đừng nhầm:

```js
'2' == 2   // true: so sánh có ép kiểu
'2' === 2  // false: khác kiểu dữ liệu
```

Source hiện có chỗ dùng `==`, vì vậy khi lần logic cần nhớ JavaScript có thể tự đổi kiểu. Trong code mới, `===` thường dễ đoán hơn.

### Boolean

```js
Boolean('text') // true
Boolean('')     // false
```

`!!value` chuyển giá trị sang boolean. Trong bộ lọc ở `views.js`, `!!x.v` biến cờ video `0`/`1` thành `false`/`true`.

### `null` và `undefined`

- `undefined`: thường là không có giá trị, ví dụ tìm thấy phần tử không tồn tại.
- `null`: thường biểu thị rõ ràng “không có giá trị”.
- `??`: chỉ dùng giá trị bên phải khi vế trái là `null` hoặc `undefined`.

```js
String(s ?? '')
```

Nếu `s` bị thiếu thì xử lý chuỗi rỗng, còn `0` hay `false` vẫn được giữ lại. Điều này khác `||`, vốn cũng thay thế `0`, `false`, `''`.

### Object và array

```js
const item = { id: 'abc', d: '2026-10-25', s: 2, v: 0, c: '' };
const tabs = [['home', '🏠', 'Trang chủ'], ['mem', '📖', 'Kỷ niệm']];
```

Object phù hợp với một bản ghi có trường được đặt tên. Array phù hợp với danh sách có thứ tự. Hầu hết dữ liệu Drive sau khi chuẩn hóa là array các object.

## 1.4. Hàm thường và arrow function

```js
function build(sf, it) {
  X.items = it;
}

const isMedia = f => /^(image|video)\//.test(f.mimeType);
```

- `function build(...) { ... }` khai báo hàm có tên.
- `f => expression` là arrow function ngắn; biểu thức được trả về tự động.
- `f => { ... }` có thân hàm nhiều câu lệnh; nếu cần trả kết quả thì dùng `return`.
- `async f => ...` là arrow function bất đồng bộ.

Các callback như `filter`, `map`, `sort`, `forEach` đều nhận hàm:

```js
const images = files.filter(f => f.mimeType.startsWith('image/'));
```

Đọc theo câu: “giữ lại những file mà MIME type bắt đầu bằng `image/`”.

## 1.5. Array methods: cách đọc luồng dữ liệu

| Method | Tác dụng | Ví dụ theo project |
|---|---|---|
| `map` | Biến mỗi phần tử thành một giá trị mới. | Chuyển tên thư mục giai đoạn thành `{id, n, slug}`. |
| `filter` | Giữ các phần tử thỏa điều kiện. | Chỉ giữ file ảnh/video. |
| `find` | Lấy phần tử đầu tiên thỏa điều kiện. | Tìm thư mục có số giai đoạn tương ứng. |
| `forEach` | Lặp để thực hiện tác dụng phụ. | Tạo bảng ánh xạ `by` hoặc `dm`. |
| `sort` | Sắp xếp trực tiếp array hiện tại. | Sắp ngày mới nhất lên trước. |
| `concat` | Nối array, tạo array kết quả mới. | Gom kết quả từ nhiều trang API. |
| `flat` | Làm phẳng array lồng nhau một cấp. | Gom các danh sách file con từ nhiều thư mục. |
| `slice` | Lấy một đoạn, không bao gồm vị trí cuối. | Chọn tối đa bốn ảnh cho một giai đoạn. |
| `some` / `includes` | Hữu ích khi cần kiểm tra điều kiện trong danh sách. | Không dùng nổi bật trong logic chính hiện tại. |

Lưu ý: `sort` thay đổi chính array được gọi. Nếu muốn giữ thứ tự gốc, tạo bản sao trước, ví dụ `[...items].sort(...)`.

## 1.6. Destructuring và spread

```js
const [year, month, day] = ymd(start, today);
const next = { n, d, k: dd(today, d), ...options };
```

- Destructuring lấy phần tử array hoặc thuộc tính object vào biến.
- `...options` (spread) chép các thuộc tính của object vào object mới.
- Trong `index.html`, spread `...(window.ENV || {})` trong `config.js` đưa `key` và `root` vào `CFG`.

Thứ tự quan trọng khi tạo object: thuộc tính xuất hiện sau có thể ghi đè thuộc tính trùng tên xuất hiện trước.

## 1.7. Template literal

```js
const url = `${API}?q=${encodeURIComponent(query)}&key=${CFG.key}`;
```

Dấu backtick cho phép:

- Chèn biểu thức bằng `${...}`.
- Viết chuỗi nhiều dòng.
- Tạo HTML dạng chuỗi trong `views.js`.

Template literal không tự escape HTML. Khi đưa dữ liệu không tin cậy vào nội dung HTML, project dùng `E(...)` ở một số vị trí. Giá trị đưa vào thuộc tính HTML/URL cũng cần xử lý đúng theo ngữ cảnh; đừng mặc định `E` giải quyết mọi kiểu injection.

## 1.8. Điều kiện và toán tử ngắn gọn

```js
const label = f ? f.slug : fallback;
const caption = hasLetters ? text : '';
```

`condition ? A : B` là toán tử ba ngôi, tương đương `if/else` cho một biểu thức.

```js
const id = found?.id;
```

`?.` là optional chaining: nếu `found` không có thì kết quả là `undefined`, thay vì lỗi khi đọc `.id`.

```js
const list = maybeList || [];
```

`||` chọn vế phải khi vế trái là falsy (`undefined`, `null`, `false`, `0`, `''`, `NaN`). Hãy phân biệt với `??`, vốn chỉ thay thế `null` và `undefined`.

## 1.9. Regex (biểu thức chính quy)

Regex được dùng để hiểu quy ước đặt tên thư mục và file:

```js
/^(\d+)_(.+)$/
/^(\d{4})(\d{2})(\d{2})(.*)$/
/^(image|video)\//
```

Một số ký hiệu:

- `^`: đầu chuỗi.
- `$`: cuối chuỗi.
- `\d`: chữ số.
- `\d{4}`: đúng bốn chữ số.
- `+`: một hoặc nhiều lần.
- `*`: không hoặc nhiều lần.
- `( ... )`: nhóm có thể lấy kết quả.
- `|`: lựa chọn “hoặc”.
- `.`: ký tự bất kỳ.
- `/i`: không phân biệt chữ hoa/chữ thường.
- `/u`: bật cách xử lý Unicode.

Trong `drive.js`, tên stage cần khớp toàn bộ mẫu số + dấu gạch dưới + slug. Tên folder ngày lấy tám chữ số đầu; phần tiếp theo có thể trở thành chú thích.

Regex ngày hiện chỉ kiểm tra tháng từ 1–12 và ngày từ 1–31. Nó chưa xác nhận ngày có hợp lệ trong tháng cụ thể (ví dụ 31/02 vẫn có thể khớp).

## 1.10. Bất đồng bộ: Promise, `async`, `await`

Gọi mạng và chờ timer mất thời gian. JavaScript không nên đứng im trong lúc đợi, vì vậy kết quả được biểu diễn bằng Promise.

```js
async function load() {
  const files = await ls(query, fields);
  build(stages, files);
}
```

- Hàm `async` luôn trả về Promise.
- `await` chờ Promise hoàn tất trong hàm async.
- Nếu Promise bị reject, lỗi được ném tại chỗ `await`; caller có thể dùng `try/catch`.

```js
await Promise.all(tasks);
```

`Promise.all` chạy các công việc Promise đồng thời và chỉ hoàn tất khi tất cả thành công. Nếu một công việc reject, Promise tổng reject. `pool` trong `drive.js` dùng cách này để giới hạn số worker song song.

## 1.11. DOM, event và dữ liệu HTML

```js
const app = document.querySelector('#app');
app.innerHTML = html;
```

- `querySelector` tìm phần tử theo CSS selector.
- `innerHTML` thay nội dung HTML bên trong phần tử.
- `addEventListener` gắn hàm xử lý sự kiện.
- `closest('[data-a]')` tìm phần tử gần nhất (kể cả chính phần tử vừa click) khớp selector.

Project dùng **event delegation**: thay vì gắn click handler cho từng nút mới tạo, `main.js` gắn một listener vào `document`. Nút HTML được tạo có `data-a`, `data-i`, `data-k` để listener biết cần gọi action nào và với dữ liệu gì.

## 1.12. Đọc mã cô đọng mà không bị lạc

Khi gặp một dòng dài:

1. Tìm các dấu `=>`, `? :`, `||`, `??`, `?.`, `...`.
2. Đọc các method array từ trái qua phải.
3. Viết lại logic trong đầu bằng `if`, `for`, biến tạm.
4. Theo dõi đầu vào và đầu ra của callback.
5. Xác định dòng có **tác dụng phụ**: sửa `X`, ghi `localStorage`, gọi API, hoặc thay `innerHTML`.

Ví dụ:

```js
const images = files.filter(f => f.mimeType.startsWith('image/'));
```

Có thể đọc tương đương:

```js
const images = [];
for (const file of files) {
  if (file.mimeType.startsWith('image/')) {
    images.push(file);
  }
}
```
