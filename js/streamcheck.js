// streamcheck.js

const fetch = require("node-fetch");  // 使用 node-fetch 来发送 HTTP 请求

const CHATGPT_TEST_URL = "https://api.openai.com/v1/completions";  // ChatGPT API URL（用于检测是否可以访问）
const TEST_PROMPT = "Hello, ChatGPT! Can you respond to this test request?";

// 检查当前网络是否能访问 ChatGPT
async function checkChatGPTConnection() {
  try {
    const response = await fetch(CHATGPT_TEST_URL, {
      method: "POST"，
      headers: {
        "Content-Type": "application/json"，
      }，
      body: JSON.stringify({
        model: "gpt-3.5-turbo"，  // 选择合适的模型进行测试
        messages: [{ role: "user", content: TEST_PROMPT }],
      }),
    });

    if (response。ok) {
      const region = await getIPRegion();  // 获取当前 IP 地区
      return {
        status: "支持",
        region: region,
      };
    } else {
      const region = await getIPRegion();  // 获取当前 IP 地区
      return {
        status: "不支持",
        region: region,
      };
    }
  } catch (error) {
    console.error("连接检测失败:", error);
    const region = await getIPRegion();  // 获取当前 IP 地区
    return {
      status: "不支持",
      region: region,
    };
  }
}

// 获取当前 IP 的地区
async function getIPRegion() {
  try {
    const ipInfoResponse = await fetch("https://ipinfo.io/json");  // 使用 ipinfo.io 获取当前 IP 地区
    const ipInfo = await ipInfoResponse.json();
    return ipInfo.region || "未知地区";
  } catch (error) {
    console.error("无法获取 IP 地区:", error);
    return "未知地区";
  }
}

// 更新磁贴显示的内容
async function updateTile() {
  const result = await checkChatGPTConnection();
  
  // 直接返回结果并更新磁贴内容
  const resultData = `${result.region}【${result.status}】`;

  console.log("更新检测结果:", resultData);
  
  // 将结果直接更新到磁贴上
  // 这个部分取决于 Stash 提供的更新磁贴内容的接口，你可以根据你的环境自定义如何更新显示内容。
  // 这里假设你能直接把内容显示在磁贴中。
  return resultData;  // 返回更新的内容
}

// 执行检测并更新磁贴内容
updateTile().catch((err) => {
  console.error("检测脚本执行出错:", err);
});
