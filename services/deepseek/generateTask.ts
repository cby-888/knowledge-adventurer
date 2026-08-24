// AI 动态出题
import { z } from "zod";
import {
  chatCompletion,
  extractJson,
  PROMPT_GUARD,
  levelInstruction,
} from "./client";

export const TaskSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  type: z.enum(["quiz", "short_answer", "scenario", "bug_fix", "conversation"]),
  question: z.string().min(1).max(2000),
  options: z.array(z.string()).max(6).nullable().optional(),
  answer: z.string().min(1).max(2000),
  explanation: z.string().min(1).max(2000),
  difficulty: z.enum(["easy", "medium", "hard", "expert"]),
  topic: z.string().min(1).max(120),
  xp: z.number().int(), // 越界值由下方 clamp 处理
  gold: z.number().int(),
});

export type GeneratedTask = z.infer<typeof TaskSchema>;

export interface GenerateTaskInput {
  career: string;
  level: number;
  topic?: string;
  difficulty?: string;
}

/** 生成一道结构化题目, 后端校验 AI 返回, 失败时抛错(由上层降级) */
export async function generateTask(
  input: GenerateTaskInput,
): Promise<GeneratedTask> {
  const system = [
    "你是一个游戏化学习平台的出题引擎。请根据指定职业、主题与难度，生成一道高质量学习任务。",
    "你必须只输出一个合法的 JSON 对象，不要输出任何其它文字、解释或 markdown 代码块。",
    "JSON 必须包含且仅包含以下字段：",
    'title(字符串, 标题), description(字符串, 一句话描述), type(枚举: "quiz"|"short_answer"|"scenario"|"bug_fix"|"conversation"), question(字符串, 题目正文), options(字符串数组, 仅 quiz 类型需要, 其它类型为 null), answer(字符串, 正确答案或评分要点), explanation(字符串, 答案解析), difficulty(枚举: "easy"|"medium"|"hard"|"expert"), topic(字符串, 知识点), xp(整数 10-500), gold(整数 1-200)。',
    "如果 type 是 quiz，options 必须包含 3-6 个选项且 answer 必须是其中一个选项的完整文本。",
    PROMPT_GUARD,
  ].join("\n");

  const topicLine = input.topic ? `主题：${input.topic}` : "主题：由你选择该职业下的一个核心知识点";
  const user = [
    `职业：${input.career}`,
    `玩家等级：Lv.${input.level}`,
    levelInstruction(input.level),
    `目标难度：${input.difficulty ?? "medium"}`,
    topicLine,
    "请生成题目并按要求输出 JSON。",
  ].join("\n");

  const content = await chatCompletion(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { jsonMode: true, temperature: 0.8, maxTokens: 1500 },
  );

  const json = extractJson(content);
  const parsed = TaskSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(
      "AI 出题结果校验失败: " +
        parsed.error.issues.map((i) => i.message).join("; "),
    );
  }

  // 服务端二次 clamp, 杜绝越界值
  return {
    ...parsed.data,
    xp: Math.min(500, Math.max(10, Math.round(parsed.data.xp))),
    gold: Math.min(200, Math.max(1, Math.round(parsed.data.gold))),
    options: parsed.data.type === "quiz" ? (parsed.data.options ?? []) : null,
  };
}
