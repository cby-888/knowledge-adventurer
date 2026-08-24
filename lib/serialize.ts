// 用户数据序列化: 剥离敏感字段(passwordHash), 输出前端可用的公开信息
import type { Prisma } from "@prisma/client";

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    userCareers: { include: { career: true } };
    userAchievements: { include: { achievement: true } };
  };
}>;

export function serializeUser(u: UserWithRelations) {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    avatar: u.avatar,
    hasAiKey: !!u.deepseekApiKey, // 只暴露是否配置了 key, 不泄露 key 本身
    level: u.level,
    xp: u.xp,
    gold: u.gold,
    hp: u.hp,
    streakDays: u.streakDays,
    totalStudyMinutes: u.totalStudyMinutes,
    tasksCompleted: u.tasksCompleted,
    createdAt: u.createdAt,
    careers: u.userCareers.map((uc) => ({
      slug: uc.career.slug,
      name: uc.career.name,
      emoji: uc.career.emoji,
      color: uc.career.color,
      level: uc.level,
      xp: uc.xp,
      isActive: uc.isActive,
    })),
    achievements: u.userAchievements.map((ua) => ({
      slug: ua.achievement.slug,
      name: ua.achievement.name,
      emoji: ua.achievement.emoji,
      unlockedAt: ua.unlockedAt,
    })),
  };
}
