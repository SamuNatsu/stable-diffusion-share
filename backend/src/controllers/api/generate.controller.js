/// API generate controller module
import joi from 'joi';

import { sd } from '../../configs/index.js';
import { loggers } from '../../utils/global.util.js';
import { newTask } from '../../services/generate.service.js';

// Body schema
const schema = joi.object({
  sid: joi.string().required(),
  prompt: joi.string().allow('').required(),
  negative_prompt: joi.string().allow('').required(),
  steps: joi.number().integer().min(1).max(sd.MAX_STEPS).required(),
  cfg_scale: joi.number().integer().min(1).max(sd.MAX_CFG_SCALE).required(),
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
    .max(sd.HR_MAX_STEPS)
    .required(),
  denoising_strength: joi.number().min(0).max(1).required(),
  hr_scale: joi.number().min(1).max(sd.HR_MAX_SCALE).required()
});

// Export module
export default function (req, res) {
  // Validate body
  const { error } = schema.validate(req.body);
  if (error !== undefined) {
    loggers.api.warn(`Invalid generate request: remote={${req.remote}}`, error);
    return res.sendStatus(400);
  }

  // Call service
  return newTask(res, req.body);
}
