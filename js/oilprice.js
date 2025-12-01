/**
 * Stash 脚本说明文档
 * 功能：查询实时油价
 * 逻辑：解析参数 -> 轮询API密钥 -> 格式化数据 -> 输出给Stash磁贴
 */

// 1. 获取来自 Stash 覆写配置(YAML)中 argument 字段传来的参数
// $argument 是 Stash 特有的内置变量
const params = getParams($argument);

// 2. 确定省份
// 如果覆写里写了 "provname=广东"，这里就用广东；
// 如果没写或者写错了，默认回退到 "江苏"。
const provinceName = params.provname || "广东";

// 3. API 接口池 (这是这个脚本最核心的容错机制)
// 作者预置了 5 个天行数据 (TianAPI) 的 Key。
// 因为免费 Key 有每日调用限制，如果第一个失效了，脚本会自动尝试下一个。
const apiUrls = [
  `https://apis.tianapi.com/oilprice/index?key=231de491563c35731436829ac52aad43&prov=${encodeURIComponent(provinceName)}`,
  `https://apis.tianapi.com/oilprice/index?key=a2bc7a0e01be908881ff752677cf94b7&prov=${encodeURIComponent(provinceName)}`,
  `https://apis.tianapi.com/oilprice/index?key=1bcc67c0114bc39a8818c8be12c2c9ac&prov=${encodeURIComponent(provinceName)}`,
  `https://apis.tianapi.com/oilprice/index?key=3c5ee42145c852de4147264f25b858dc&prov=${encodeURIComponent(provinceName)}`,
  `https://apis.tianapi.com/oilprice/index?key=d718b0f7c2b6d71cb3a9814e90bf847f&prov=${encodeURIComponent(provinceName)}`
];

// 当前正在尝试第几个 URL (索引从 0 开始)
let currentIndex = 0;

// 4. 定义核心请求函数：尝试下一个 URL
function testNextUrl() {
  // 如果 5 个 Key 都试完了还是失败，那就彻底放弃
  if (currentIndex >= apiUrls.length) {
    console.log("All URLs failed"); // 在日志里打印失败信息
    $done(); // 告诉 Stash 脚本结束，不显示任何数据
    return;
  }

  // 获取当前的 API 地址
  const apiUrl = apiUrls[currentIndex];

  // 发起网络请求 (Stash 内置方法 $httpClient)
  $httpClient.get(apiUrl, (error, response, data) => {
    if (error) {
      // 如果网络不通 (比如断网了)，打印错误，并尝试下一个 Key
      console.log(`Error for URL ${currentIndex + 1}: ${error}`);
      currentIndex++;
      testNextUrl(); // 【递归调用】自己调自己，重试
    } else {
      // 如果网络通了，进入数据处理环节
      handleResponse(data);
    }
  });
}

// 5. 定义响应处理函数
function handleResponse(data) {
  // API 返回的数据是纯文本，需要转换成 JSON 对象
  const oilPriceData = JSON.parse(data);
  console.log(oilPriceData); // 打印数据方便调试

  // code 200 代表 API 返回成功
  if (oilPriceData.code === 200) {
    const oilPriceInfo = oilPriceData.result;
    
    // 组装要在磁贴上显示的文字内容 (\n 代表换行)
    const message = `📍地区：${oilPriceInfo.prov}\n⛽0号柴油：${oilPriceInfo.p0}元/升\n⛽89号汽油：${oilPriceInfo.p89}元/升\n⛽92号汽油：${oilPriceInfo.p92}元/升\n⛽95号汽油：${oilPriceInfo.p95}元/升\n⛽98号汽油：${oilPriceInfo.p98}元/升\n🕰︎更新时间：${oilPriceInfo.time}`;

    // 构建最终传回给 Stash 的对象
    const body = {
      title: "今日油价",       // 磁贴标题
      content: message,       // 磁贴正文
      provname: params.provname, // 传递参数
      icon: params.icon,      // 图标
      "icon-color": params.color // 图标颜色
    };
    
    // 【任务完成】将数据渲染到界面上
    $done(body);
  } else {
    // 如果 API 返回非 200 (比如 Key 过期了，或次数超限)
    console.log(`请求失败，错误信息：${oilPriceData.msg}`);
    // 索引加 1，尝试下一个 Key
    currentIndex++;
    testNextUrl();
  }
}

// 6. 辅助工具函数：解析 URL 格式的参数字符串
// 例如把 "provname=广东&icon=car" 变成对象 {provname: "广东", icon: "car"}
function getParams(param) {
  return Object.fromEntries(
    param
      .split("&")
      .map((item) => item.split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
}

// 7. 【脚本入口】开始运行，尝试第一个链接
testNextUrl();
