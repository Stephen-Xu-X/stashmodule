/**
 * 单平台检测脚本
 * 文件名: streamcheck.js
 * 逻辑: 默认检测 OpenAI，根据 IP 返回地区旗帜
 */

// 1. 安全获取参数 (防止因参数为空导致脚本崩溃)
const params = getParams($argument) || {};
const appName = params.app || "OpenAI"; 
const icon = params.icon || "bolt";

// 定义检测目标 (这里仅保留 OpenAI，确保极简)
const url = "https://chat.openai.com/cdn-cgi/trace";

// 2. 发起网络请求
$httpClient。get(url， (error, response， data) => {
  let content = "检测失败";
  let color = "#ff3b30"; // 红色

  if (error) {
    console。log(`[StreamCheck] 请求失败: ${error}`);
    content = "网络连接错误";
  } else {
    // 3. 解析 OpenAI 返回的 loc=XX 字段
    const match = data.match(/loc=([A-Z]{2})/);
    if (match) {
      const region = match[1];
      const flag = getFlagEmoji(region);
      content = `地区: ${flag} ${region}`;
      color = "#32d74b"; // 绿色
    } else {
      content = "不支持 / N/A";
    }
  }

  // 4. 返回结果给磁贴
  $done({
    title: `${appName} 检测`,
    content: content,
    icon: icon,
    backgroundColor: color
  });
});

// --- 辅助函数 ---

function getParams(param) {
  // 如果没有任何参数传入，直接返回空对象，避免报错
  if (!param) return {};
  return Object.fromEntries(
    param.split("&").map((item) => item.split("=")).map(([k, v]) => [k, decodeURIComponent(v)])
  );
}

function getFlagEmoji(countryCode) {
  if (!countryCode) return "🌍";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}
