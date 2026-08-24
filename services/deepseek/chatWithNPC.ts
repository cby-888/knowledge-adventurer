// AI NPC 对话
import {
  chatCompletion,
  PROMPT_GUARD,
  levelInstruction,
  type ChatMessage,
} from "./client";

export interface NpcInfo {
  name: string;
  emoji: string;
  title: string;
  systemPrompt: string;
}

export interface ChatWithNpcInput {
  npc: NpcInfo;
  playerLevel: number;
  careerName?: string;
  history: ChatMessage[]; // 不含本次用户消息的历史
  userMessage: string;
}

/** 与 AI NPC 对话, 返回助手的回复文本 */
export async function chatWithNPC(input: ChatWithNpcInput): Promise<string> {
  const system = [
    input.npc.systemPrompt,
    `你是「${input.npc.name}」(${input.npc.title})${input.npc.emoji}。`,
    levelInstruction(input.playerLevel),
    input.careerName ? `学生主修职业：${input.careerName}。` : "",
    "回答要简洁、友好、有引导性，可以反问、出题或提示，但一次不要讲太长。",
    "若学生在学习英语场景，请尽量用英语交流，并在必要时用简短中文提示。",
    PROMPT_GUARD,
  ]
    .filter(Boolean)
    .join("\n");

  const messages: ChatMessage[] = [
    { role: "system", content: system },
    ...input.history.slice(-10), // 只保留最近 10 条, 控制 token
    { role: "user", content: input.userMessage },
  ];

  return chatCompletion(messages, { temperature: 0.8, maxTokens: 800 });
}
