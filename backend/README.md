# Stable diffusion share - Backend

## RESTful API

### \[GET\] /api/info

Get system info

**Controller file:** src/controllers/api/info.controller.js

**Response:**

Code 200, a JSON string of system info object like below, some info might be `null`.

```json
{
  "sd": {
    "ALLOW_HR": true,
    "BASIC_SIZE": 512,
    "HR_MAX_SCALE": 2,
    "HR_MAX_STEPS": 100,
    "HR_UPSCALER": "upscaler",
    "MAX_CFG_SCALE": 20,
    "MAX_STEPS": 100,
    "MODEL_NAME": "model name",
    "MODEL_URL": "model url",
    "PREPEND_NEGATIVE_PROMPT": "prepend negative prompt",
    "PREPEND_PROMPT": "prompt",
    "SAMPLER": "sampler"
  },
  "sys": {
    "MAX_QUEUE_LEN": 30,
    "NOTIFICATION": "notification",
    "PROVIDER_CONTACT": "provider contact",
    "PROVIDER_NAME": "provider name"
  }
}
```

### \[GET\] /api/sse

Server-Sent Event peer

**Controller file:** src/controllers/api/sse.controller.js

**Response:**

Please use `EventSource` to connect. Message event and data described below:

|Event|Intro|Example|
|:---:|:---:|:---:|
|session|session ID string for new connector|"abcdefg"|
|serial|serial number of received task|191810|
|queue|serial number that generating now|114514|
|done|generated txt2img response data|`Please see sd-webui txt2img API reponse`|
|fail|fail message|"generate", "api", "queue"|

### \[POST\] /api/generate

Post a generate task

**Controller file:** src/controllers/api/generate.controller.js

**Response:**

Code 400 for invalid arguments.

Code 401 for no session ID.

Code 204 for successfully submit.
