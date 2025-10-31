const fs = require('fs');
const path = require('path');
const db = {};

/**
 * Hàm này sẽ quét đệ quy qua các thư mục để tìm và nạp các model.
 * @param {string} directory - Thư mục bắt đầu để quét.
 */
function loadModels(directory) {
  // Đọc tất cả các file và thư mục con trong đường dẫn được cung cấp
  const items = fs.readdirSync(directory);

  for (const item of items) {
    const fullPath = path.join(directory, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Nếu là thư mục, gọi lại chính hàm này để đi sâu vào trong (đệ quy)
      loadModels(fullPath);
    } else if (stat.isFile() && item.endsWith('.js') && item !== 'index.js') {
      // Nếu là file Javascript (và không phải là file index.js này)
      const model = require(fullPath);
      // Chỉ thêm vào db nếu nó thực sự là một model của Mongoose
      if (model && model.modelName) {
        db[model.modelName] = model;
      }
    }
  }
}

// Bắt đầu quá trình quét từ thư mục chứa file index.js này (__dirname)
loadModels(__dirname);

// Xuất ra đối tượng db chứa tất cả các model đã tìm thấy
module.exports = db;