# Stable Diffusion Share

## Development

Frontend written in Vue3 and Vite, you can easily modify

Backend wriiten in CommonJS, also easily modify

So there is no need to read this part

## Deployment

1. Download artifacts on [Github Action](https://github.com/SamuNatsu/stable-diffusion-share/actions), you'd better use most recent one

2. Unzip & untar artifact

3. Install dependencies (pnpm example command: `pnpm i -P`)

4. Modify config file `.env`

5. Start server: `node server.cjs`

## Config

Look at `.env` file, those options start with a sharp `#` are options that have default value

You are REQUIRED to fill these options:

1. `SD_API`: Your stable diffusion API url formats like `http://localhost:7860/sdapi/v1/txt2img`

2. `SD_CKPT_NAME`: Your model name, you can get all model names by requiring `/sdapi/sd-models`

3. `SD_SAMPLER_NAME`: Your sampler name, you can get all sampler names by requiring `/sdapi/samplers`

4. `SD_HR_UPSCALER`: Your HiRes.fix upscaler name, you can get all names by requiring `/sdapi/upscalers`
