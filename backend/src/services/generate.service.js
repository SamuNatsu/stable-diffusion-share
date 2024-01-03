/// Generate service module
import async from 'async';
import jb from 'json-bigint';
import moment from 'moment';

import { broadcast, hasSession, send } from './sse.service.js';
import { loggers } from '../utils/global.util.js';
import { sd, sys } from '../configs/index.js';

// JSON big
const JSONbig = jb({ useNativeBigInt: true });

// Accumulated serial
let serial = 0;

// Current serial
let curSerial = -1;

// Task queue
const queue = async.queue(async (task) => {
  // Get start time
  const time = moment().format('YYYY-MM-DD HH:mm:ss Z');

  // Notify other sessions
  curSerial = task.serial;
  broadcast('queue', curSerial);

  // Check session available
  if (!hasSession(task.sid)) {
    loggers.generate.warn(
      `Session not found: serial=${task.serial} sid=${task.sid}`
    );
    return;
  }

  // Convert ratio to width and height
  const matches = /^([1-9]\d*):([1-9]\d*)$/.exec(task.args.ratio);
  task.args.ratio = Math.sqrt(parseInt(matches[1]) / parseInt(matches[2]));
  task.args.width = Math.ceil(sd.BASIC_SIZE * task.args.ratio);
  task.args.height = Math.ceil(sd.BASIC_SIZE / task.args.ratio);
  delete task.args.ratio;

  // Convert seed string to bigint
  task.args.seed = BigInt(task.args.seed);

  // Construct payload
  const payload = {
    ...task.args,
    sampler_name: sd.SAMPLER,
    hr_upscaler: sd.HR_UPSCALER,
    hr_checkpoint_name: sd.MODEL_NAME,
    hr_sampler_name: sd.SAMPLER,
    hr_prompt: task.args.prompt,
    hr_negative_prompt: task.args.negative_prompt,
    save_images: true
  };
  loggers.generate.info(
    `Generating image: serial=${task.serial}, time={${time}}`,
    payload
  );

  // Await fetching
  await fetch(sd.API, {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    body: JSONbig.stringify(payload)
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      }

      // Fail to generate
      loggers.generate.warn(`Fail to generate: serial=${task.serial}`, res);
      send(task.sid, 'fail', 'generate');
    })
    .then((data) => {
      if (data === undefined) {
        return;
      }

      // Generated
      loggers.generate.info(`Generated: serial=${task.serial}`);
      send(task.sid, 'done', data);
    })
    .catch((err) => {
      // Fail to query
      loggers.generate.warn(`Fail to query API: serial=${task.serial}`, err);
      send(task.sid, 'fail', 'api');
    });
});
queue.error((err, task) => {
  loggers.generate.warn(`Unexpected generate error: serial=${task.serial}`, err);
  send(task.sid, 'fail', 'api');
});

// New task
export function newTask(res, task) {
  // Check session ID
  const sid = task.sid;
  delete task.sid;
  if (!hasSession(sid)) {
    loggers.generate.warn(`Session not found: sid=${sid}`);
    return res.sendStatus(401);
  }

  // Check queue capacity
  if (queue.length() >= sys.MAX_QUEUE_LEN) {
    send(sid, 'fail', 'queue');
    loggers.generate.warn(`Queue is full: sid=${sid}`);
    return res.sendStatus(204);
  }

  // Push new task
  send(sid, 'serial', serial);
  if (serial !== curSerial + 1) {
    send(sid, 'queue', curSerial);
  }
  queue.push({ sid, serial, args: task });
  loggers.generate.info(`New generating task: sid=${sid}, serial=${serial}`);
  serial++;
  return res.sendStatus(204);
}
