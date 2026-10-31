// 编写网页交互和动态行为
let studentName = "小明";
const courseName = "前端开发";

console.log(studentName);
console.log(courseName);

const button = document.querySelector("#helloButton");
const message = document.querySelector("#message");


button.addEventListener("click", function () {
    message.textContent = "调用支付接口，已支付！";
    alert("点击确定，取消订单");
});