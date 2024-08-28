import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());

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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const message = generateRandomString(10); // 生成一个长度为1000的随机字符串
  let index = 0;

  const intervalId = setInterval(() => {
    if (index < message.length) {
      res.write(`id: ${index}\n`);
      res.write(`data: ${message[index]}\n\n`);
      index += 1;
    } else {
      clearInterval(intervalId);
      res.write('event: end\n');
      res.write('data: Stream Ended\n\n');
      res.end();
    }
  }, 50);

  req.on('close', () => {
    clearInterval(intervalId);
    res.end();
  });
});

app.listen(port, () => {
  console.log(`Mock server listening at http://localhost:${port}`);
});
