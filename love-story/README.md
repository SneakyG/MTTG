# Our Love Story 💕

Web app theo dõi chặng đường yêu nhau của MTrieu và TGiang. Ảnh và clip đọc trực tiếp từ Google Drive, không cần server, chạy trên GitHub Pages.

## Cấu trúc project

```
love-story/
├── index.html                    # khung trang
├── css/style.css                 # giao diện (sáng/tối tự động)
├── js/
│   ├── env.example.js            # mẫu khoá API + ID thư mục (copy thành env.js, không commit)
│   ├── config.js                 # tên, giai đoạn hiện tại, ngày bắt đầu, ngày đặc biệt
│   ├── utils.js                  # hàm tiện ích, hằng số, trạng thái
│   ├── drive.js                  # đọc cây thư mục Google Drive
│   ├── milestones.js             # thời gian bên nhau, mốc sắp tới
│   ├── views.js                  # Trang chủ, Kỷ niệm, Hành trình
│   ├── lightbox.js               # xem ảnh/clip toàn màn hình
│   ├── splash.js                 # màn hình mở đầu, nền động, hiệu ứng tim
│   ├── music.js                  # nhạc nền, bật tắt có nhỏ dần/to dần
│   ├── wish.js                   # hiệu ứng dung hợp và popup lời chúc
│   ├── edit.js                   # đăng nhập Google, thêm/xoá ảnh-clip, mục Sắp tới
│   └── main.js                   # vẽ giao diện, sự kiện, khởi động
├── assets/favicon.svg, assets/music/   # đặt the-gioi-cua-anh.mp3 vào assets/music/
├── .github/workflows/deploy.yml  # tự deploy, tạo env.js từ GitHub Secrets
├── .gitignore
└── .nojekyll
```

## Thư mục trên Google Drive

```
MTTG/
├── 1_tim_hieu/
│   ├── images/
│   │   └── 20240214/     ảnh của ngày 14/02/2024, tên file tuỳ ý
│   └── videos/
│       └── 20240214/     clip của ngày đó, tên file tuỳ ý
├── 2_nguoi_yeu/          (cùng cấu trúc)
├── 3_vo_chong/, 4_co_con/, 5_ve_gia/
└── 6_avatar/             MTrieu.jpg, TGiang.jpg
```

- Tên thư mục ngày là `yyyyMMdd`; file bên trong đặt tên gì cũng được. Thêm chữ sau ngày để làm chú thích: thư mục `20240214_Valentine đầu tiên`.
- Ảnh và clip cùng ngày (ở `images` và `videos`) được gom chung một ngày trong app.
- Thư mục avatar có tên chứa chữ "ava"; ảnh đặt tên theo `a` và `b` trong `js/config.js`.
- Thêm kỷ niệm: tạo thư mục ngày trong `images` hoặc `videos`, bỏ file vào, rồi bấm "Cập nhật" trong app.
- Nhạc nền: đặt `the-gioi-cua-anh.mp3` vào `assets/music/`, hoặc bỏ file mp3 vào thư mục MTTG trên Drive (app tự tìm khi không có file trong assets). Nhạc có bản quyền: đừng để trong repo công khai.
- Popup lời chúc (bấm trái tim giữa hai avatar): ảnh có cả hai người đặt trong `6_avatar` (ngoài `MTrieu` và `TGiang`); không có thì lấy ngẫu nhiên một ảnh kỷ niệm. Sửa lời chúc trong `js/config.js`, mục `wishes`.

## Thiết lập một lần

1. Google Cloud Console: tạo project, bật **Google Drive API**, tạo **API key**. Giới hạn key: HTTP referrers `https://TENBAN.github.io/*` (thêm `http://localhost:8000/*` nếu chạy ở máy) và chỉ cho phép Google Drive API.
2. Trên Drive, chia sẻ thư mục MTTG ở chế độ "Anyone with the link: Viewer". ID thư mục là đoạn sau `/folders/` trong link.
3. Sửa `js/config.js`: `current`, `start`, `events`.

## Thêm/xoá ảnh, clip và sửa mục "Sắp tới" (cần đăng nhập Google)

Xem dữ liệu chỉ cần API key. Ghi lên Drive thì cần thêm OAuth Client ID:

1. Google Cloud Console → APIs & Services → OAuth consent screen: chọn External, điền tên app, thêm email của bạn và người ấy vào **Test users**.
2. Credentials → Create credentials → OAuth client ID → Web application. Authorized JavaScript origins: `https://TENBAN.github.io` (và `http://localhost:8000` nếu chạy ở máy). Copy **Client ID** vào `js/env.js` (mục `clientId`) hoặc Secret `GOOGLE_CLIENT_ID`.
3. Chia sẻ thư mục MTTG cho tài khoản của người ấy với quyền **Editor** (tài khoản chủ thư mục đã có quyền).
4. Lần đầu bấm Thêm, Xoá hoặc Lưu sẽ hiện cửa sổ đăng nhập Google. Nếu có cảnh báo "Google chưa xác minh ứng dụng": Nâng cao, rồi tiếp tục. Phiên đăng nhập hết hạn sau khoảng 1 giờ, app tự hỏi lại.

- **Thêm:** chọn loại (ảnh hoặc clip), chọn thư mục ngày có sẵn hoặc tạo mới theo ngày. Thư mục mới nằm trong giai đoạn hiện tại, lưu vào `images/yyyyMMdd` hoặc `videos/yyyyMMdd`.
- **Xoá:** bấm "Chọn để xoá", chọn ảnh/clip rồi Xoá. Google chỉ cho người tải lên (chủ sở hữu tệp) xoá hẳn, kể cả khi thư mục của người khác. Tệp của bạn chuyển vào thùng rác Drive (khôi phục được trong 30 ngày); tệp do người khác tải lên thì app chỉ gỡ khỏi album, tệp vẫn nằm trong Drive của họ và họ có thể tự xoá (đăng nhập app bằng tài khoản của họ).
- **Sắp tới:** lưu trong file `sap_toi.txt` ở thư mục MTTG (mỗi dòng `yyyy-MM-dd|Tên|y`). Mục đã qua ngày tự biến mất, mục lặp hằng năm thì chuyển sang năm sau.

## Chạy ở máy

```
cp js/env.example.js js/env.js     # rồi điền key và root
python3 -m http.server 8000        # mở http://localhost:8000
```

## Deploy lên GitHub Pages

1. Đẩy code lên nhánh `main`: `git init`, `git add .`, `git commit -m "init"`, `git remote add origin ...`, `git push -u origin main`.
2. Settings → Secrets and variables → Actions → New repository secret: `DRIVE_API_KEY` và `DRIVE_ROOT_ID`.
3. Settings → Pages → Source: **GitHub Actions**. Mỗi lần push, workflow tự tạo `js/env.js` từ Secrets rồi deploy.

Cách đơn giản hơn: xoá dòng `js/env.js` trong `.gitignore`, điền key vào `js/env.js`, commit, rồi chọn Pages → Deploy from a branch.

## Lưu ý

- Key vẫn nằm trong JS mà trình duyệt tải về, nên bắt buộc giới hạn key theo domain.
- Thư mục chia sẻ dạng link: ai có link đều xem được ảnh.
