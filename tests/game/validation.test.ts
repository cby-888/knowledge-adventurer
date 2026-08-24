import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeAnswer,
  isQuizCorrect,
  scoreQuiz,
} from "../../lib/game/validation";

test("normalizeAnswer 规范化", () => {
  assert.equal(normalizeAnswer("  Hello, World!  "), "hello world");
  assert.equal(normalizeAnswer("PE"), "pe");
  assert.equal(normalizeAnswer("A."), "a");
});

test("isQuizCorrect 完整答案匹配", () => {
  assert.equal(isQuizCorrect("Price to Earnings", "price-to-earnings"), true);
  assert.equal(isQuizCorrect("pe", "pe"), true);
  assert.equal(isQuizCorrect("pb", "pe"), false);
});

test("isQuizCorrect 选项字母匹配", () => {
  assert.equal(isQuizCorrect("B", "B. 市盈率"), true);
  assert.equal(isQuizCorrect("b", "B. 市盈率"), true);
  assert.equal(isQuizCorrect("A", "B. 市盈率"), false);
});

test("isQuizCorrect 完整选项文本匹配", () => {
  const options = ["A. 市盈率", "B. 市净率", "C. 市销率", "D. 股息率"];
  assert.equal(isQuizCorrect("市盈率", "A. 市盈率", options), true);
  assert.equal(isQuizCorrect("市净率", "A. 市盈率", options), false);
});

test("scoreQuiz 判分", () => {
  assert.equal(scoreQuiz("B", "B. 市净率"), 100);
  assert.equal(scoreQuiz("A", "B. 市净率"), 0);
  assert.equal(scoreQuiz("", "B. 市净率"), 0);
});
