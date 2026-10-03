import type { ComicDocument, TextDocument } from '../types';

const DEMO_TEXT = `Màn hình máy tính vẫn sáng, nhưng ngoài cửa sổ, thành phố đã lên đèn. Cô nhìn đồng hồ lần thứ ba trong vòng năm phút. Hôm nay có một điều gì đó rất khác.\n\nMột thông báo nhỏ xuất hiện ở góc phải màn hình. Không phải email công việc, cũng không phải tin nhắn từ đồng nghiệp. Đó là lời nhắc về cuốn truyện cô bỏ dở từ tối qua.\n\n“Chỉ một chương nữa thôi,” cô tự nhủ. Thế nhưng, ai cũng biết những lời hứa như vậy thường kết thúc ra sao.\n\nTrên màn hình, từng dòng chữ lặng lẽ hiện ra. Bàn phím không còn tiếng gõ vội vã. Ngoài hành lang, tiếng bước chân mỗi lúc một gần.\n\nCô nhanh tay chuyển sang bảng tính. Những ô vuông ngăn nắp trông vô cùng đáng tin cậy. Có lẽ đây chính là môi trường làm việc hiệu quả nhất mà cô từng thấy.\n\nCánh cửa bật mở. “Tiến độ hôm nay thế nào rồi?”\n\n“Tất cả đang nằm trong bảng tính,” cô đáp, không hề nói sai một chữ nào.\n\nDĩ nhiên, đây chỉ là một câu chuyện vui. Đọc sách khi rảnh luôn là một ý tưởng tuyệt vời hơn.\n\nMột ngày nào đó, người ta sẽ phát minh ra một công cụ giúp những điều bình thường trở nên thú vị. Có thể công cụ ấy mang hình dáng của một cuốn sổ, một tờ giấy, hoặc một cửa sổ phần mềm rất quen thuộc.`;

export function demoText(): TextDocument {
  return { kind: 'text', id: 'demo-text', name: 'An ordinary Monday', chapters: [{ title: 'Chapter 01 — An ordinary Monday' }], getText: async () => DEMO_TEXT, dispose: () => {} };
}

export function demoComic(): ComicDocument {
  return { kind: 'comic', id: 'demo-comic', name: 'An ordinary Monday', pageCount: 1, getImage: async () => '/demo-comic.svg', dispose: () => {} };
}
