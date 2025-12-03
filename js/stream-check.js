/**
 * Stash AI & 流媒体检测脚本
 * 核心功能：根据参数检测特定服务的连通性及落地地区
 * * 使用参数 (在 YAML argument 中填写):
 * app=OpenAI   -> 检测 ChatGPT
 * app=Netflix  -> 检测 Netflix
 * icon=xxx     -> 自定义图标
 */

const params = getParams($argument);
const appName = params.app || "OpenAI"; // 默认检测 OpenAI
const icon = params.icon || "bolt";

// 不同的服务定义不同的检测 URL 和解析逻辑
const strategies = {
  "OpenAI": {
    url: "https://chat.openai.com/cdn-cgi/trace",
    // OpenAI 的 trace 接口会直接返回 loc=US 这样的文本
    check: (data, headers, status) => {
      if (status !== 200) return null;
      const match = data.match(/loc=([A-Z]{2})/);
      return match ? match[1] : null;
    }
  },
  "Netflix": {
    url: "https://www.netflix.com/title/80018499", // 这是一个免费查看的影片ID
    // Netflix 主要是看是否屏蔽 IP，通过重定向头或页面内容判断
    check: (data, headers, status) => {
      // 简单判断：如果能访问且没被拦截
      if (status === 200 || status === 302) {
        // Netflix 比较特殊，这里为了简化脚本，我们默认如果通了就去查一次 IP 归属地
        // 或者简单的返回 "OK" (因为 Netflix 网页版很难直接拿地区代码)
        // 进阶版通常配合 ip-api 使用，这里我们先用 "Global" 代替，或者你需要更复杂的 Header 分析
        return "Global"; 
      }
      return null;
    }
  }
};

// 1. 获取当前策略
const currentStrategy = strategies[appName];

if (!currentStrategy) {
  $done({ title: "错误", content: `不支持的参数: ${appName}`, icon: "xmark" });
} else {
  // 2. 发起请求
  $httpClient.get(currentStrategy.url, (error, response, data) => {
    let regionCode = null;
    let content = "";
    let color = "#ff3b30"; // 默认红色 (不解锁/失败)

    if (!error) {
      // 执行对应 APP 的解析逻辑
      regionCode = currentStrategy.check(data, response.headers, response.status);
    }

    if (regionCode) {
      // 成功解锁
      // 如果是 Global (针对 Netflix 简易版)，就不显示旗帜
      const flag = regionCode === "Global" ? "🌍" : getFlagEmoji(regionCode);
      const displayRegion = regionCode === "Global" ? "解锁" : regionCode;
      
      content = `${appName}: ${flag} ${displayRegion}`;
      color = "#32d74b"; // 绿色
    } else {
      // 失败
      content = `${appName}: N/A`;
    }

    $done({
      title: `${appName} 检测`,
      content: content,
      icon: icon,
      backgroundColor: color
    });
  });
}

// --- 辅助工具 ---

// 解析 YAML 参数
function getParams(param) {
  return Object.fromEntries(
    param.split("&").map((item) => item.split("=")).map(([k, v]) => [k, decodeURIComponent(v)])
  );
}

// 将地区代码 (US, HK) 转为 Emoji 旗帜 (🇺🇸, 🇭🇰)
function getFlagEmoji(countryCode) {
  if (!countryCode) return "";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}
