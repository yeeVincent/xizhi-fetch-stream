import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());

app.get('/stream', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let count = 0;

  const intervalId = setInterval(() => {
    count += 1;
    res.write(`id: ${count}\n`);
    res.write(`data: Message ${count}\n\n`);
    // Optionally, stop the stream after a certain number of messages
    if (count >= 10) {
      clearInterval(intervalId);
      res.write('event: end\n');
      res.write('data: Stream Ended\n\n');
      res.end();
    }
  }, 1000);

  req.on('close', () => {
    clearInterval(intervalId);
    res.end();
  });
});

app.listen(port, () => {
  console.log(`Mock server listening at http://localhost:${port}`);
});
