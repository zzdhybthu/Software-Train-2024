import express from "express";
const router = express.Router(); // 实例化express.Router类
router.get("/aba", (req, res) => {
    res.status(200).send("ok!");
})
export default router; // 导出后，这个Router就成为了一个中间件

