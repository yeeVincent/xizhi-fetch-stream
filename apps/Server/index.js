import express from 'express';
import cors from 'cors';
import compression from 'compression';
import SSE from 'express-sse';

const app = express();
const port = 3000;
const sse = new SSE();

app.use(cors());
app.use(compression()); // 使用 compression 中间件

// 生成随机字符串的函数
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

app.get('/stream', (req, res) => {
  console.log('收到请求');
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  sse.init(req, res);

  const message = generateRandomString(10); // 生成一个长度为10的随机字符串
  let index = 0;

  const intervalId = setInterval(() => {
    if (index < message.length) {
      const data = {id: index, code: 200, msg: 'success', data: {content: message[index], finish: false, t: +new Date()}};
      sse.send(data);
      index += 1;
    } else {
      clearInterval(intervalId);
      sse.send({ data: { finish: true }, message: "Stream Ended"}, 'end');
      res.end(); // 结束响应
      
      
    }
  }, 50);

  req.on('close', () => {
    clearInterval(intervalId);
  });
});

app.listen(port, () => {
  console.log(`Mock server listening at http://localhost:${port}`);
});
