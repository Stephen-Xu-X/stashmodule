/**
 * 倒数日脚本
 * 路径：js/countdown.js
 */

const params = getParams($argument);
// 如果没有参数，默认倒数到 2026年春节 (2026-02-17)
const targetDateStr = params.date || "2026-02-17"; 
const title = params.title || "春节倒计时";
const icon = params.icon || "hourglass";

// 计算日期差
const 当前 = new Date();
const target = new Date(targetDateStr);
const diffTime = target.getTime() - now.getTime();
const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

let content = "";
let color = "#32d74b"; // 绿色

if (diffDays > 0) {
  content = `还有 ${diffDays} 天`;
} else if (diffDays === 0) {
  content = "就是今天！";
  color = "#ff9f0a"; // 橙色
} else {
  content = `已过去 ${Math.abs(diffDays)} 天`;
  color = "#ff453a"; // 红色
}

$done({
  title: title,
  content: content,
  icon: icon,
  backgroundColor: color
});

function getParams(param) {
  return Object.fromEntries(
    param.split("&").map((item) => item.split("=")).map(([k, v]) => [k, decodeURIComponent(v)])
  );
}
