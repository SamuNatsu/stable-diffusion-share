'use strict';

// Import modules
const dotenv = require('dotenv');
const joi = require('joi');
const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
const { nanoid } = require('nanoid');
const async = require('async');
const JSONbig = require('json-bigint')({ useNativeBigInt: true });

// Get environment
dotenv.config();

const NOTIFICATION = process.env.NOTIFICATION ?? '';

const PROVIDER_NAME = process.env.PROVIDER_NAME ?? 'Stable Diffusion Share';
const PROVIDER_CONTACT = process.env.PROVIDER_CONTACT ?? null;

const PORT = parseInt(process.env.PORT ?? '3000');
const SSL = process.env.SSL === 'true';
const SSL_CERT = process.env.SSL_CERT;
const SSL_KEY = process.env.SSL_KEY;

const SD_API = process.env.SD_API;
const SD_CKPT_NAME = process.env.SD_CKPT_NAME;
const SD_CKPT_URL = process.env.SD_CKPT_URL ?? null;
const SD_PREPEND_PROMPT = process.env.SD_PREPEND_PROMPT ?? '';
const SD_PREPEND_NEGATIVE_PROMPT = process.env.SD_PREPEND_NEGATIVE_PROMPT ?? '';
const SD_MAX_STEPS = parseInt(process.env.SD_MAX_STEPS ?? '50');
const SD_MAX_CFG_SCALE = parseInt(process.env.SD_MAX_CFG_SCALE ?? '20');
const SD_BASIC_SIZE = parseInt(process.env.SD_BASIC_SIZE ?? '512');
const SD_SAMPLER_NAME = process.env.SD_SAMPLER_NAME;
const SD_MAX_HR_STEPS = parseInt(process.env.SD_MAX_HR_STEPS ?? '50');
const SD_HR_UPSCALER = process.env.SD_HR_UPSCALER;
const SD_HR_SCALE = parseInt(process.env.SD_HR_SCALE ?? '2');

// Schemas
const taskScheme = joi.object({
  sid: joi.string().required(),
  prompt: joi.string().allow('').required(),
  negative_prompt: joi.string().allow('').required(),
  steps: joi.number().integer().min(1).max(SD_MAX_STEPS).required(),
  cfg_scale: joi.number().integer().min(1).max(SD_MAX_CFG_SCALE).required(),
  seed: joi
    .string()
    .pattern(/^(-1|0|[1-9]\d*)$/)
    .required(),
  ratio: joi
    .string()
    .pattern(/^[1-9]\d*:[1-9]\d*$/)
    .required(),
  enable_hr: joi.boolean().required(),
  hr_second_pass_steps: joi
    .number()
    .integer()
    .min(1)
    .max(SD_MAX_HR_STEPS)
    .required(),
  denoising_strength: joi.number().min(0).max(1).required()
});

// Session map
const sessions = {};
function genSID() {
  let sid = nanoid(32);
  while (sessions[sid] !== undefined) {
    sid = nanoid(32);
  }
  return sid;
}
function broadcastSession(event, data) {
  Object.values(sessions).forEach((s) => {
    s.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  });
}
function sendSession(sid, event, data) {
  sessions[sid]?.res.write(
    `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  );
}

// Task queue
let serial = 0;
const queue = async.queue(async (task) => {
  console.log(
    `[Core] Generating image: ${task.serial}@${new Date().toISOString()}`
  );
  broadcastSession('queue', task.serial);

  const matches = /^([1-9]\d*):([1-9]\d*)$/.exec(task.args.ratio);
  task.args.ratio = Math.sqrt(parseInt(matches[1]) / parseInt(matches[2]));
  task.args.height = Math.ceil(SD_BASIC_SIZE * task.data.ratio);
  task.args.width = Math.ceil(SD_BASIC_SIZE / task.data.height);
  delete task.args.ratio;

  const payload = {
    ...task.args,
    seed: BigInt(task.args.seed),
    sampler_name: SD_SAMPLER_NAME,
    hr_scale: SD_HR_SCALE,
    hr_upscaler: SD_HR_UPSCALER,
    hr_checkpoint_name: SD_CKPT_NAME,
    hr_sampler_name: SD_SAMPLER_NAME,
    hr_prompt: task.args.prompt,
    hr_negative_prompt: task.args.negative_prompt,
    save_images: true
  };
  console.log(payload);

  fetch(SD_API, {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    body: JSONbig.stringify(payload)
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
      console.error(`[Core] Fail to generate: ${task.serial}`);
      console.error(res.statusText);
      sendSession(task.sid, 'fail', 'generate');
    })
    .then((data) => {
      if (data === undefined) {
        return;
      }
      console.log(`[Core] Generated: ${task.serial}`);
      sendSession(task.sid, 'done', data);
    })
    .catch((err) => {
      console.error(`[Core] Fail to send generating query: ${task.serial}`);
      console.error(err);
      sendSession(task.sid, 'fail', 'fetch');
    });
});

// Create express server
const app = express();
app
  .use((req, _, next) => {
    req.remote = `${req.socket.remoteAddress}:${req.socket.remotePort}`;
    next();
  })
  .use(express.static('./www'))
  .use(express.json())
  .get('/api/info', (req, res) => {
    console.log(`[Core] Query info from {${req.remote}}`);
    res.send({
      notification: NOTIFICATION,
      provider: {
        name: PROVIDER_NAME,
        contact: PROVIDER_CONTACT
      },
      sd: {
        ckpt_name: SD_CKPT_NAME,
        ckpt_url: SD_CKPT_URL,
        prepend_prompt: SD_PREPEND_PROMPT,
        prepend_negative_prompt: SD_PREPEND_NEGATIVE_PROMPT,
        max_steps: SD_MAX_STEPS,
        max_cfg_scale: SD_MAX_CFG_SCALE,
        basic_size: SD_BASIC_SIZE,
        sampler_name: SD_SAMPLER_NAME,
        max_hr_steps: SD_MAX_HR_STEPS,
        hr_upscaler: SD_HR_UPSCALER,
        hr_scale: SD_HR_SCALE
      }
    });
  })
  .get('/api/sse', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    console.log(`[SSE] Connection opened from {${req.remote}}`);

    const sid = genSID();
    sessions[sid] = { req, res };
    sendSession(sid, 'session', sid);
    console.log(`[SSE] Session started from {${req.remote}}: ${sid}`);

    res.on('close', () => {
      console.log(`[SSE] Connection closed from {${req.remote}}: ${sid}`);
      delete sessions[sid];
    });
  })
  .post('/api/generate', (req, res) => {
    const { error } = taskScheme.validate(req.body);
    if (error !== undefined) {
      return res.sendStatus(400);
    }
    if (sessions[req.body.sid] === undefined) {
      return res.sendStatus(401);
    }

    console.log(`[SSE] New task received: ${serial}`);
    const sid = req.body.sid;
    delete req.body.sid;
    queue.push({ sid, args: req.body, serial });
    res.send({ serial });
    serial++;
  });

// Create HTTP(S) server
if (SSL) {
  SSL_CERT = fs.readFileSync(SSL_CERT, 'utf-8');
  SSL_KEY = fs.readFileSync(SSL_KEY, 'utf-8');
}
const server = SSL
  ? https.createServer({ cert: SSL_CERT, key: SSL_KEY }, app)
  : http.createServer(app);

// Start listening
server.listen(PORT, () => {
  console.log(`[Core] Server listening on port ${PORT}`);
});
