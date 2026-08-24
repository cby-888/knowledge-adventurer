// 任务提交业务逻辑 —— 本地判分 + AI 评分 + 首次答对防刷
import { prisma } from "@/lib/prisma";
import { applyRewards } from "@/server/rewards";
import { scoreQuiz } from "@/lib/game/validation";
import {
  scaleTaskReward,
  rewardForScore,
  type Difficulty,
} from "@/lib/game/rewards";
import { evaluateAnswer } from "@/services/deepseek/evaluateAnswer";
import { isConfigured } from "@/services/deepseek/client";

export interface SubmitResult {
  correct: boolean;
  score: number;
  feedback: string;
  explanation: string;
  xpAwarded: number;
  goldAwarded: number;
  isFirstCorrect: boolean;
  alreadyCompleted: boolean;
  newLevel: number;
  leveledUp: boolean;
  newlyUnlockedAchievements: { slug: string; name: string; emoji: string }[];
}

export async function submitTask(
  userId: string,
  taskId: string,
  userAnswer: string,
): Promise<SubmitResult> {
  const task = await prisma.task.findUniqueOrThrow({ where: { id: taskId } });
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const answer = (userAnswer ?? "").trim();
  if (!answer) throw new Error("答案不能为空");

  // 防刷: 是否已经首次答对并领取过奖励
  const existingFirstCorrect = await prisma.taskAttempt.findFirst({
    where: { userId, taskId, isFirstCorrect: true },
  });

  const fullReward = scaleTaskReward(
    task.xp,
    task.gold,
    task.difficulty as Difficulty,
  );

  let score: number;
  let correct: boolean;
  let feedback: string;

  if (task.type === "quiz" && task.options) {
    // 选择题: 本地精确判定, 不消耗 AI
    const options = task.options as string[];
    score = scoreQuiz(answer, task.answer, options);
    correct = score === 100;
    feedback = correct
      ? "回答正确，继续加油！"
      : `回答错误。正确答案：${task.answer}`;
  } else {
    // 主观题: AI 评分
    if (!isConfigured()) {
      throw new Error(
        "主观题需要 AI 评分，请先在 .env 配置 DEEPSEEK_API_KEY",
      );
    }
    const careerName = task.careerId
      ? ((await prisma.career.findUnique({ where: { id: task.careerId } }))
          ?.name ?? "")
      : "";

    const evaluation = await evaluateAnswer({
      career: careerName,
      question: task.question,
      referenceAnswer: task.answer,
      userAnswer: answer,
      playerLevel: user.level,
      taskType: task.type,
    });
    score = evaluation.score;
    correct = evaluation.correct;
    feedback = evaluation.feedback;
  }

  // 只有首次答对才发奖励(按得分折算)
  let xpAwarded = 0;
  let goldAwarded = 0;
  let isFirstCorrect = false;
  if (!existingFirstCorrect && correct) {
    isFirstCorrect = true;
    const earned = rewardForScore(fullReward, score);
    xpAwarded = earned.xp;
    goldAwarded = earned.gold;
  }

  await prisma.taskAttempt.create({
    data: {
      taskId,
      userId,
      userAnswer: answer,
      score,
      correct,
      xpAwarded,
      goldAwarded,
      feedback,
      isFirstCorrect,
    },
  });

  let rewardResult: Awaited<ReturnType<typeof applyRewards>> | null = null;
  if (isFirstCorrect) {
    rewardResult = await applyRewards({
      userId,
      xp: xpAwarded,
      gold: goldAwarded,
      activityType: task.isAiGenerated ? "ai_task" : "task_completed",
      careerId: task.careerId,
      taskId: task.id,
      minutesSpent: 2,
      incrementTaskCount: true,
      metadata: { taskId: task.id, score },
    });
  }

  return {
    correct,
    score,
    feedback,
    explanation: task.explanation,
    xpAwarded,
    goldAwarded,
    isFirstCorrect,
    alreadyCompleted: !!existingFirstCorrect,
    newLevel: rewardResult?.newLevel ?? user.level,
    leveledUp: rewardResult?.leveledUp ?? false,
    newlyUnlockedAchievements:
      rewardResult?.newlyUnlockedAchievements ?? [],
  };
}
