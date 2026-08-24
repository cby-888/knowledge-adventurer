// DeepSeek 服务统一出口
export {
  chatCompletion,
  extractJson,
  getConfig,
  isConfigured,
  levelInstruction,
  PROMPT_GUARD,
  DeepSeekNotConfiguredError,
  type ChatMessage,
} from "./client";

export { generateTask, TaskSchema, type GeneratedTask } from "./generateTask";
export { evaluateAnswer, type Evaluation } from "./evaluateAnswer";
export { chatWithNPC, type ChatWithNpcInput, type NpcInfo } from "./chatWithNPC";
export {
  generateHint,
  generateExplanation,
  type HintInput,
  type ExplanationInput,
} from "./generateHint";
