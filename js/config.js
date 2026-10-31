// Cài đặt công khai của app. Khoá API và ID thư mục nằm riêng trong js/env.js
const CFG={
  ...(window.ENV||{}),   // key, root
  a:'MTrieu', b:'TGiang', // tên hai bạn (cũng là tên file ảnh trong thư mục avatar)
  current:2,              // giai đoạn hiện tại: 1 tìm hiểu, 2 người yêu, 3 vợ chồng, 4 có con, 5 về già
  start:{},               // ngày bắt đầu từng giai đoạn, vd {2:'2024-02-14'}; bỏ trống = lấy ngày của ảnh đầu tiên
  events:[],              // ngày đặc biệt lặp mỗi năm, vd [{n:'Sinh nhật em',d:'2000-05-20'}]
  music:'assets/music/the-gioi-cua-anh.mp3', // nhạc nền; không có file này thì app tự tìm file mp3 trong thư mục MTTG trên Drive
  wishes:[ // lời chúc trong popup khi bấm trái tim; {a} và {b} là tên hai bạn
    `Chúc {a} và {b} luôn nắm tay nhau đi qua cả những ngày nắng đẹp lẫn những ngày giông bão. Mong mỗi sáng thức dậy, hai bạn vẫn thấy người bên cạnh là nơi bình yên nhất của mình.`,
    `Mong rằng nhiều năm sau, khi mở lại những tấm ảnh trong kho kỷ niệm này, {a} và {b} vẫn mỉm cười như lần đầu. Chúc hai bạn thương nhau nhiều hơn, giận nhau ít hơn, và luôn đủ kiên nhẫn để hiểu nhau.`,
    `Chúc {a} và {b} cùng nhau đi hết con đường này: từ những ngày tìm hiểu rụt rè, đến một mái nhà đủ ấm, đến khi tóc bạc vẫn nắm tay nhau đi dạo mỗi chiều.`,
    `Chúc hai bạn luôn biết lắng nghe, biết xin lỗi trước, biết nói lời cảm ơn mỗi ngày. Tình yêu bền lâu không phải vì không có sóng gió, mà vì cả hai chưa bao giờ buông tay.`,
    `Mong ước mơ của {a} và ước mơ của {b} đều có chỗ trong tương lai chung. Chúc hai bạn trưởng thành cùng nhau, mạnh khỏe, bình an và hạnh phúc dài lâu.`
  ]
};
