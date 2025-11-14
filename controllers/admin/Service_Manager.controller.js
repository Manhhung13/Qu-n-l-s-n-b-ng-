const db = require("../../db");

exports.getServices = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM services");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Không thể lấy danh sách dịch vụ" });
  }
};

exports.createService = async (req, res) => {
  try {
    const { name, price } = req.body;
    console.log(name, price);
    await db.query("INSERT INTO services (name, price) VALUES (?, ?)", [
      name,
      price,
    ]);
    res.json({ message: "Thêm dịch vụ thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi thêm dịch vụ" });
  }
};

exports.updateService = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const { name, price } = req.body;
    await db.query("UPDATE services SET name = ?, price = ? WHERE id = ?", [
      name,
      price,
      serviceId,
    ]);
    res.json({ message: "Cập nhật dịch vụ thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi cập nhật dịch vụ" });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const serviceId = req.params.id;
    await db.query("DELETE FROM services WHERE id = ?", [serviceId]);
    res.json({ message: "Xóa dịch vụ thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi xóa dịch vụ" });
  }
};
