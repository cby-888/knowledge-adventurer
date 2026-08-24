// DeepSeek 服务层测试 —— 通过 mock fetch 验证解析/校验/钳制逻辑
import { test } from "node:test";
import assert from "node:assert/strict";
import { extractJson } from "../services/deepseek/client";
import { evaluateAnswer } from "../services/deepseek/evaluateAnswer";
import { generateTask } from "../services/deepseek/generateTask";

function jsonResponse(content: unknown) {
  return new Response(
    JSON.stringify({ choices: [{ message: { content: JSON.stringify(content) } }] }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

test("extractJson 解析纯 JSON / 代码块 / 前后缀", () => {
  assert.deepEqual(extractJson('{"a":1}'), { a: 1 });
  assert.deepEqual(extractJson('```json\n{"a":1}\n```'), { a: 1 });
  assert.deepEqual(extractJson('说明文字 {"a":1} 尾巴'), { a: 1 });
  assert.throws(() => extractJson("这里没有 json"));
});

test("evaluateAnswer 校验并钳制分数到 0-100", async () => {
  process.env.DEEPSEEK_API_KEY = "test-key";
  const original = globalThis.fetch;
  globalThis.fetch = (async () =>
    jsonResponse({ correct: true, score: 150, feedback: "很棒" })) as typeof fetch;
  try {
    const r = await evaluateAnswer({
      career: "编程",
      question: "q",
      referenceAnswer: "a",
      userAnswer: "a",
      playerLevel: 1,
      taskType: "short_answer",
    });
    assert.equal(r.score, 100); // 150 被钳制到 100
    assert.equal(r.correct, true);
    assert.equal(r.feedback, "很棒");
  } finally {
    globalThis.fetch = original;
  }
});

test("generateTask 通过 zod 校验正常 JSON", async () => {
  process.env.DEEPSEEK_API_KEY = "test-key";
  const good = {
    title: "t",
    description: "d",
    type: "quiz",
    question: "q",
    options: ["A. 1", "B. 2"],
    answer: "A. 1",
    explanation: "e",
    difficulty: "easy",
    topic: "topic",
    xp: 999, // 超出上限, 应被 clamp
    gold: 1,
  };
  const original = globalThis.fetch;
  globalThis.fetch = (async () => jsonResponse(good)) as typeof fetch;
  try {
    const t = await generateTask({ career: "编程", level: 1 });
    assert.equal(t.xp, 500); // 被钳制
    assert.deepEqual(t.options, ["A. 1", "B. 2"]);
  } finally {
    globalThis.fetch = original;
  }
});

test("generateTask 拒绝非法 JSON(缺字段)", async () => {
  process.env.DEEPSEEK_API_KEY = "test-key";
  const original = globalThis.fetch;
  globalThis.fetch = (async () =>
    jsonResponse({ title: "只有标题" })) as typeof fetch;
  try {
    await assert.rejects(() => generateTask({ career: "编程", level: 1 }));
  } finally {
    globalThis.fetch = original;
  }
});
