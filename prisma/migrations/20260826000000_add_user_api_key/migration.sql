-- 给用户表新增「自己的 DeepSeek Key」字段(BYOK)
ALTER TABLE "users" ADD COLUMN "deepseekApiKey" TEXT;
