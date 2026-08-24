// AI 自动评分(主观题)
import { z } from "zod";
import {
  chatCompletion,
  extractJson,
  PROMPT_GUARD,
  levelInstruction,
} from "./client";

const EvalSchema = z.object({
  correct: z.boolean(),
  score: z.number().int(), // 越界值由下方 clamp 处理
  feedback: z.string().min(1).max(1000),
});

export type Evaluation = z.infer<typeof EvalSchema>;

export interface EvaluateInput {
  career: string;
  question: string;
  referenceAnswer: string;
  userAnswer: string;
  playerLevel: number;
  taskType: string;
}

/** 调用 DeepSeek 对主观题答案评分 */
export async function evaluateAnswer(
  input: EvaluateInput,
): Promise<Evaluation> {
  const system = [
    "你是一个严格但鼓励式的 AI 批改老师。请根据参考答案，评估学生的作答。",
    "评分维度：正确性、完整性、表达清晰度；同时结合学生当前水平给予反馈。",
    "你必须只输出一个合法 JSON 对象，不要输出任何其它文字。",
    'JSON 字段：correct(布尔, 是否达到及格线, 即 score>=60), score(整数 0-100), feedback(字符串, 中文反馈, 指出亮点与不足并给出改进建议)。',
    PROMPT_GUARD,
  ].join("\n");

  const user = [
    `职业：${input.career}`,
    `题型：${input.taskType}`,
    levelInstruction(input.playerLevel),
    `题目：${input.question}`,
    `参考答案：${input.referenceAnswer}`,
    `学生作答：${input.userAnswer}`,
    "请评分并输出 JSON。",
  ].join("\n");

  const content = await chatCompletion(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { jsonMode: true, temperature: 0.3, maxTokens: 800 },
  );

  const json = extractJson(content);
  const parsed = EvalSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(
      "AI 评分结果校验失败: " +
        parsed.error.issues.map((i) => i.message).join("; "),
    );
  }

  // 服务端二次兜底: 分数必须落在 0-100
  const score = Math.max(0, Math.min(100, Math.round(parsed.data.score)));
  return {
    correct: score >= 60,
    score,
    feedback: parsed.data.feedback,
  };
}
