// 生成提示 / 讲解
import {
  chatCompletion,
  PROMPT_GUARD,
  levelInstruction,
} from "./client";

export interface HintInput {
  career: string;
  question: string;
  playerLevel: number;
}

/** 给出一道题的渐进式提示(不直接给答案) */
export async function generateHint(input: HintInput): Promise<string> {
  const system = [
    "你是一个学习助教。请给出「引导式提示」，帮助学生自己思考，而不是直接给出答案。",
    levelInstruction(input.playerLevel),
    PROMPT_GUARD,
  ].join("\n");

  const user = `职业：${input.career}\n题目：${input.question}\n请给出 1-2 句引导式提示。`;
  return chatCompletion(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.5, maxTokens: 300 },
  );
}

export interface ExplanationInput {
  career: string;
  question: string;
  answer: string;
  playerLevel: number;
}

/** 生成详细解析 */
export async function generateExplanation(
  input: ExplanationInput,
): Promise<string> {
  const system = [
    "你是一个知识讲解老师。请用清晰的结构讲解，必要时举例。",
    levelInstruction(input.playerLevel),
    PROMPT_GUARD,
  ].join("\n");

  const user = [
    `职业：${input.career}`,
    `题目：${input.question}`,
    `答案：${input.answer}`,
    "请给出详细解析。",
  ].join("\n");

  return chatCompletion(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.6, maxTokens: 800 },
  );
}
