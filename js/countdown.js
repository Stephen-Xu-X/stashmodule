/**
 * Stash 倒数日脚本
 * 参数：title=标题&date=目标日期(YYYY-MM-DD)&icon=图标
 */

const params = getParams($argument);
const targetDateStr = params.date || "2026-01-01"; // 默认日期
const title = params.title || "重要日子";
const icon = params.icon || "calendar";

// 计算逻辑
const now = new Date();
const target = new Date(targetDateStr);
// 修正时区差异，简化处理
const diffTime = target.getTime() - now.getTime();
const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

let content = "";
let color = "#32d74b"; // 绿色 (未来)

if (diffDays > 0) {
  content = `还有 ${diffDays} 天`;
} else if (diffDays === 0) {
  content = "就是今天！";
  color = "#ff9f0a"; // 橙色
} else {
  content = `已过去 ${Math.abs(diffDays)} 天`;
  color = "#ff453a"; // 红色 (过去)
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
