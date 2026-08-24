// 答案规范化与判分 —— 纯函数, 无外部依赖。
// 选择题可本地精确判定; 主观题交由 DeepSeek 评分(见 services/deepseek)。

/** 规范化答案: 小写、连字符/下划线转空格、去空白、去常见标点 */
export function normalizeAnswer(s: string): string {
  return (s ?? "")
    .trim()
    .toLowerCase()
    .replace(/[-_/\\]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[.,!?;:'"()（）【】]/g, "");
}

/** 去掉选项开头的字母前缀, 例如 "A. 市盈率" -> "市盈率" */
function stripOptionPrefix(s: string): string {
  return s.replace(/^[a-d][.、:)]\s*/i, "").trim();
}

/**
 * 判断选择题答案是否正确。
 * 支持: 完整答案 / 选项字母(A/B/C/D) / 选项正文(不带字母前缀)。
 */
export function isQuizCorrect(
  userAnswer: string,
  correctAnswer: string,
  options?: string[],
): boolean {
  const uRaw = normalizeAnswer(userAnswer);
  const cRaw = normalizeAnswer(correctAnswer);
  if (!uRaw || !cRaw) return false;

  // 1) 完整一致(含字母前缀)
  if (uRaw === cRaw) return true;

  // 正确选项的正文(去字母前缀)
  const cContent = normalizeAnswer(stripOptionPrefix(correctAnswer));

  // 2) 用户只填了字母
  if (/^[a-d]$/.test(uRaw)) {
    const cLetter = cRaw.match(/^([a-d])/i)?.[1]?.toLowerCase();
    if (cLetter === uRaw) return true;
    // 从 options 反查字母对应的正文
    const match = (options ?? []).find(
      (o) => normalizeAnswer(o).match(/^([a-d])/i)?.[1]?.toLowerCase() === uRaw,
    );
    if (!match) return false;
    return normalizeAnswer(stripOptionPrefix(match)) === cContent;
  }

  // 3) 用户填了选项正文(或带前缀的完整选项文本)
  const uContent = normalizeAnswer(stripOptionPrefix(userAnswer));
  return uContent === cContent;
}

/** 选择题判分: 对 100, 错 0 */
export function scoreQuiz(
  userAnswer: string,
  correctAnswer: string,
  options?: string[],
): number {
  return isQuizCorrect(userAnswer, correctAnswer, options) ? 100 : 0;
}
