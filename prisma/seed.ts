// Knowledge Adventurer — 数据库种子数据
// 运行: pnpm prisma:seed   (依赖 tsx)
// 首次启动后自动拥有: 4 职业 / 28 技能 / 40 任务 / 20 成就 / 4 NPC / 9 地图区 / 测试用户

import { PrismaClient, Prisma, TaskType, Difficulty, ActivityType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type CareerSeed = {
  slug: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  order: number;
  topics: string[];
};

type SkillSeed = {
  careerSlug: string;
  slug: string;
  name: string;
  description: string;
  tier: number;
  levelRequirement: number;
  xpReward: number;
  prerequisites: string[];
  positionX: number;
  positionY: number;
};

type TaskSeed = {
  careerSlug: string;
  title: string;
  description: string;
  type: TaskType;
  difficulty: Difficulty;
  question: string;
  options: string[] | null;
  answer: string;
  explanation: string;
  xp: number;
  gold: number;
  topic: string;
};

// ─────────────────────────── 职业 ───────────────────────────
const careers: CareerSeed[] = [
  {
    slug: "investing",
    name: "投资分析师",
    emoji: "📈",
    description: "研究股票、ETF、加密资产与宏观经济，掌握估值与风险管理，成为投资大师。",
    color: "#f59e0b",
    order: 1,
    topics: ["股票", "ETF", "Bitcoin", "Ethereum", "宏观经济", "财报", "PE", "PB", "ROE", "现金流", "公司分析", "风险管理", "资产配置", "牛熊市", "市场周期"],
  },
  {
    slug: "ai",
    name: "AI 工程师",
    emoji: "🤖",
    description: "学习 LLM、Prompt、RAG 与 Agent 开发，构建真正的 AI 应用。",
    color: "#a78bfa",
    order: 2,
    topics: ["AI 基础", "LLM", "Prompt Engineering", "API", "Python", "RAG", "Embedding", "Agent", "Tool Calling", "AI 应用开发", "模型部署", "AI 产品设计"],
  },
  {
    slug: "programming",
    name: "编程大师",
    emoji: "💻",
    description: "从 HTML 到全栈，掌握前端、后端、数据结构与算法。",
    color: "#22d3ee",
    order: 3,
    topics: ["HTML", "CSS", "JavaScript", "TypeScript", "Python", "Git", "GitHub", "数据结构", "算法", "API", "数据库", "前端开发", "后端开发"],
  },
  {
    slug: "english",
    name: "英语冒险家",
    emoji: "🇬🇧",
    description: "通过 AI 对话场景练习听、说、读、写，成为 English Master。",
    color: "#34d399",
    order: 4,
    topics: ["英语字母", "音标", "单词", "语法", "阅读", "听力", "口语", "写作", "日常对话", "商务英语"],
  },
];

// ─────────────────────────── 技能(每职业 7 层) ───────────────────────────
const skillTrees: Record<string, string[]> = {
  investing: ["金融学徒", "市场观察者", "财务分析员", "公司研究员", "投资分析师", "高级投资分析师", "投资大师"],
  ai: ["AI 学徒", "Prompt 学徒", "AI 应用开发者", "Agent 工程师", "AI 工程师", "高级 AI 工程师", "AI Architect"],
  programming: ["代码学徒", "前端新手", "JavaScript 冒险者", "Python 冒险者", "全栈开发者", "高级程序员", "编程大师"],
  english: ["英语萌新", "单词学徒", "基础交流者", "英语冒险家", "流利交流者", "高级英语冒险家", "English Master"],
};

const skillDescriptions: Record<string, string[]> = {
  investing: ["了解市场基本概念", "学会观察行情与周期", "读懂三大财务报表", "深入分析公司基本面", "掌握估值与建模", "形成完整投资框架", "驾驭市场, 成为大师"],
  ai: ["认识 AI 与 LLM 基础", "掌握 Prompt 技巧", "开发 AI 应用", "构建 Agent 与工具调用", "系统掌握 AI 工程", "设计复杂 AI 系统", "AI 架构设计"],
  programming: ["认识代码与开发环境", "掌握 HTML/CSS", "JavaScript 编程", "Python 编程", "前后端贯通", "工程化与架构", "编程大师"],
  english: ["认识字母与音标", "积累核心词汇", "基础日常交流", "场景对话", "流利表达", "复杂话题讨论", "English Master"],
};

function buildSkills(): SkillSeed[] {
  const out: SkillSeed[] = [];
  for (const [careerSlug, names] of Object.entries(skillTrees)) {
    names.forEach((name, i) => {
      const tier = i + 1;
      // 使用稳定的 ASCII slug(中文名无法直接用做 slug)
      const slug = `${careerSlug}-skill-${tier}`;
      const prev = i > 0 ? [`${careerSlug}-skill-${i}`] : [];
      out.push({
        careerSlug,
        slug,
        name,
        description: skillDescriptions[careerSlug]?.[i] ?? name,
        tier,
        levelRequirement: tier, // 第 N 层技能需玩家 Lv.N
        xpReward: tier * 20, // 解锁奖励 XP
        prerequisites: prev,
        positionX: tier * 180,
        positionY: 0,
      });
    });
  }
  return out;
}

// ─────────────────────────── 任务(每职业 10 个) ───────────────────────────
const tasks: TaskSeed[] = [
  // 投资分析师
  {
    careerSlug: "investing", title: "什么是 PE？", description: "理解市盈率这一最基础的估值指标。",
    type: TaskType.quiz, difficulty: Difficulty.easy, topic: "PE",
    question: "PE（市盈率）代表什么？",
    options: ["A. 股价与每股盈利的比率", "B. 股价与每股净资产的比率", "C. 公司总负债与总资产的比率", "D. 每股分红与股价的比率"],
    answer: "A. 股价与每股盈利的比率",
    explanation: "PE = 股价 / 每股收益(EPS)，衡量市场愿意为每单位盈利支付多少价格。",
    xp: 50, gold: 20,
  },
  {
    careerSlug: "investing", title: "ROE 是什么", description: "认识净资产收益率。",
    type: TaskType.short_answer, difficulty: Difficulty.easy, topic: "ROE",
    question: "ROE 的全称是什么？它衡量什么？",
    options: null,
    answer: "净资产收益率（Return on Equity），衡量公司用股东净资产创造利润的能力，ROE = 净利润 / 净资产。",
    explanation: "ROE 越高，说明公司利用股东资金的效率越高。",
    xp: 50, gold: 20,
  },
  {
    careerSlug: "investing", title: "牛市特征", description: "识别牛市与熊市。",
    type: TaskType.quiz, difficulty: Difficulty.medium, topic: "牛熊市",
    question: "以下哪项最符合「牛市」的典型特征？",
    options: ["A. 股价长期上涨、投资者情绪乐观", "B. 股价长期下跌、成交量萎缩", "C. 企业普遍亏损、利率大幅上行", "D. 现金为王、避险资产独涨"],
    answer: "A. 股价长期上涨、投资者情绪乐观",
    explanation: "牛市通常表现为指数长期上行、市场情绪高涨、风险偏好上升。",
    xp: 75, gold: 30,
  },
  {
    careerSlug: "investing", title: "为什么要资产配置", description: "理解分散投资的意义。",
    type: TaskType.short_answer, difficulty: Difficulty.medium, topic: "资产配置",
    question: "简述「资产配置」的核心目的（1-2 句话）。",
    options: null,
    answer: "通过把资金分散到低相关性的资产（股票、债券、现金、另类等）中，在控制风险的前提下追求更稳定的长期回报。",
    explanation: "核心是「不把鸡蛋放在一个篮子里」，降低单一资产波动带来的风险。",
    xp: 75, gold: 30,
  },
  {
    careerSlug: "investing", title: "ETF 是什么", description: "认识交易型开放式指数基金。",
    type: TaskType.quiz, difficulty: Difficulty.easy, topic: "ETF",
    question: "ETF 最准确的描述是？",
    options: ["A. 像股票一样在交易所买卖的基金", "B. 只能在银行柜台申购的理财", "C. 一种加密货币", "D. 一种债券"],
    answer: "A. 像股票一样在交易所买卖的基金",
    explanation: "ETF（交易型开放式指数基金）追踪某一指数，可在二级市场像股票一样交易。",
    xp: 50, gold: 20,
  },
  {
    careerSlug: "investing", title: "三大财务报表", description: "财报分析的基石。",
    type: TaskType.short_answer, difficulty: Difficulty.medium, topic: "财报",
    question: "请列出企业三大财务报表的名称。",
    options: null,
    answer: "资产负债表、利润表（损益表）、现金流量表。",
    explanation: "资产负债表看家底、利润表看赚钱能力、现金流量表看真金白银。",
    xp: 75, gold: 30,
  },
  {
    careerSlug: "investing", title: "Bitcoin 的风险", description: "理解加密资产的高波动与风险。",
    type: TaskType.scenario, difficulty: Difficulty.hard, topic: "风险管理",
    question: "假设你把全部积蓄投入 Bitcoin 并期望短期翻倍，这违反了哪条投资原则？请说明。",
    options: null,
    answer: "违反了「分散投资 / 风险管理」原则。把全部资金押注单一高波动资产，一旦暴跌将面临巨大亏损。应控制仓位、分散配置并只用闲钱投资。",
    explanation: "高波动资产应小仓位参与，并做好亏损准备；虚拟投资仅为模拟，不构成投资建议。",
    xp: 100, gold: 40,
  },
  {
    careerSlug: "investing", title: "PB 与 PE 的区别", description: "区分两种估值指标。",
    type: TaskType.short_answer, difficulty: Difficulty.hard, topic: "PB",
    question: "PB（市净率）与 PE（市盈率）分别用什么作分母？各更适合哪类公司？",
    options: null,
    answer: "PB 用每股净资产作分母，更适合重资产/金融类公司；PE 用每股收益作分母，更适合盈利稳定的成长型公司。",
    explanation: "PB = 股价/每股净资产；PE = 股价/每股收益。",
    xp: 100, gold: 40,
  },
  {
    careerSlug: "investing", title: "现金流为何重要", description: "理解「现金为王」。",
    type: TaskType.scenario, difficulty: Difficulty.medium, topic: "现金流",
    question: "一家公司利润很高但经营现金流持续为负，可能意味着什么？",
    options: null,
    answer: "利润可能只是「纸面利润」，大量收入是应收账款、库存积压或会计调节所致，实际没有真金白银流入，长期可能面临流动性危机。",
    explanation: "利润可以修饰，现金流更难造假，经营现金流是公司造血能力的核心指标。",
    xp: 75, gold: 30,
  },
  {
    careerSlug: "investing", title: "市场周期阶段", description: "认识周期轮动。",
    type: TaskType.quiz, difficulty: Difficulty.medium, topic: "市场周期",
    question: "市场周期通常不包含以下哪个阶段？",
    options: ["A. 复苏", "B. 繁荣", "C. 衰退", "D. 冻结"],
    answer: "D. 冻结",
    explanation: "典型经济/市场周期为复苏→繁荣→衰退→萧条，再进入下一轮复苏。",
    xp: 75, gold: 30,
  },

  // AI 工程师
  {
    careerSlug: "ai", title: "什么是 LLM", description: "认识大语言模型。",
    type: TaskType.quiz, difficulty: Difficulty.easy, topic: "LLM",
    question: "LLM 的英文全称是？",
    options: ["A. Large Language Model", "B. Low Level Module", "C. Linear Logic Machine", "D. Local Learning Map"],
    answer: "A. Large Language Model",
    explanation: "LLM = 大语言模型，通过海量文本训练获得语言理解与生成能力。",
    xp: 50, gold: 20,
  },
  {
    careerSlug: "ai", title: "Prompt 是什么", description: "理解提示词工程。",
    type: TaskType.short_answer, difficulty: Difficulty.easy, topic: "Prompt Engineering",
    question: "什么是 Prompt？写出一个好 Prompt 的至少两个要点。",
    options: null,
    answer: "Prompt 是给模型的输入指令。好 Prompt 要点：目标明确、提供上下文、给出格式要求、必要时给示例（few-shot）。",
    explanation: "清晰的指令能显著提升模型输出质量。",
    xp: 50, gold: 20,
  },
  {
    careerSlug: "ai", title: "RAG 是什么", description: "理解检索增强生成。",
    type: TaskType.quiz, difficulty: Difficulty.medium, topic: "RAG",
    question: "RAG（检索增强生成）的核心流程是？",
    options: ["A. 先检索相关知识，再让模型基于知识生成答案", "B. 模型直接背诵全部知识", "C. 只做关键词搜索", "D. 用规则引擎回答问题"],
    answer: "A. 先检索相关知识，再让模型基于知识生成答案",
    explanation: "RAG = 检索(Retrieval) + 增强(Augmented) + 生成(Generation)，降低幻觉、接入私有知识。",
    xp: 75, gold: 30,
  },
  {
    careerSlug: "ai", title: "Embedding 的作用", description: "理解向量嵌入。",
    type: TaskType.short_answer, difficulty: Difficulty.medium, topic: "Embedding",
    question: "什么是 Embedding？它在 RAG 中起什么作用？",
    options: null,
    answer: "Embedding 是把文本映射为高维向量，语义相近的文本向量距离更近；在 RAG 中用于把查询与知识库片段做相似度检索。",
    explanation: "向量检索是 RAG 的关键一环。",
    xp: 75, gold: 30,
  },
  {
    careerSlug: "ai", title: "Agent 与 Tool Calling", description: "理解智能体与工具调用。",
    type: TaskType.quiz, difficulty: Difficulty.medium, topic: "Agent",
    question: "AI Agent 相比普通聊天模型的核心区别是？",
    options: ["A. 能调用工具、执行多步任务并决策", "B. 回答更快", "C. 参数更多", "D. 不需要 API"],
    answer: "A. 能调用工具、执行多步任务并决策",
    explanation: "Agent 通过 Tool Calling 与外部工具交互，自主规划并完成任务。",
    xp: 75, gold: 30,
  },
  {
    careerSlug: "ai", title: "用 Prompt 生成 JSON", description: "结构化输出练习。",
    type: TaskType.short_answer, difficulty: Difficulty.medium, topic: "Prompt Engineering",
    question: "写一段 Prompt，让 AI 把「今天天气很好」转换成一个 JSON，格式为 {\"text\": \"...\", \"sentiment\": \"...\"}。",
    options: null,
    answer: "示例：「请将下面的文本转换为 JSON，只输出 JSON，不要多余解释，字段为 text 和 sentiment。文本：今天天气很好」",
    explanation: "明确格式、字段和输出约束是稳定结构化输出的关键。",
    xp: 75, gold: 30,
  },
  {
    careerSlug: "ai", title: "模型部署方式", description: "了解模型服务化。",
    type: TaskType.scenario, difficulty: Difficulty.hard, topic: "模型部署",
    question: "把一个大模型上线成 API 服务，需要考虑哪些方面？至少列出三点。",
    options: null,
    answer: "示例：GPU 资源与吞吐、推理延迟与并发、模型版本管理与回滚、成本控制、监控告警、安全与限流。",
    explanation: "部署不只是跑通模型，还要考虑稳定性、成本与安全。",
    xp: 100, gold: 40,
  },
  {
    careerSlug: "ai", title: "API 调用基础", description: "理解 HTTP API。",
    type: TaskType.quiz, difficulty: Difficulty.easy, topic: "API",
    question: "调用一个 REST API 时，最常用于「发送数据」的 HTTP 方法是？",
    options: ["A. POST", "B. GET", "C. HEAD", "D. OPTIONS"],
    answer: "A. POST",
    explanation: "POST 通常用于提交数据；GET 用于读取。",
    xp: 50, gold: 20,
  },
  {
    careerSlug: "ai", title: "AI 产品设计", description: "从技术到产品。",
    type: TaskType.scenario, difficulty: Difficulty.hard, topic: "AI 产品设计",
    question: "设计一个 AI 学习助手产品，你最先要明确的三件事是什么？",
    options: null,
    answer: "示例：目标用户与核心痛点、核心场景与价值主张、成功指标与风险（如内容准确性）。",
    explanation: "先想清楚「为谁解决什么问题」，再谈技术实现。",
    xp: 100, gold: 40,
  },
  {
    careerSlug: "ai", title: "什么是 Fine-tuning", description: "理解模型微调。",
    type: TaskType.quiz, difficulty: Difficulty.hard, topic: "LLM",
    question: "Fine-tuning（微调）指的是？",
    options: ["A. 在预训练模型基础上用特定数据继续训练，使其更擅长特定任务", "B. 从头训练一个全新模型", "C. 只调整 API 调用参数", "D. 压缩模型体积"],
    answer: "A. 在预训练模型基础上用特定数据继续训练，使其更擅长特定任务",
    explanation: "微调是在已有预训练模型上，用领域数据继续训练，提升特定任务表现。",
    xp: 100, gold: 40,
  },

  // 编程大师
  {
    careerSlug: "programming", title: "HTML 标签", description: "网页结构基础。",
    type: TaskType.quiz, difficulty: Difficulty.easy, topic: "HTML",
    question: "用于定义一个一级标题的 HTML 标签是？",
    options: ["A. <h1>", "B. <title>", "C. <header>", "D. <p>"],
    answer: "A. <h1>",
    explanation: "<h1> 到 <h6> 表示六级标题，<h1> 级别最高。",
    xp: 50, gold: 20,
  },
  {
    careerSlug: "programming", title: "CSS 选择器", description: "样式选择基础。",
    type: TaskType.quiz, difficulty: Difficulty.easy, topic: "CSS",
    question: "以下哪个选择器会选择 id 为 \"app\" 的元素？",
    options: ["A. #app", "B. .app", "C. app", "D. *app"],
    answer: "A. #app",
    explanation: "# 用于 id 选择器，. 用于 class 选择器。",
    xp: 50, gold: 20,
  },
  {
    careerSlug: "programming", title: "JavaScript 类型", description: "基础数据类型。",
    type: TaskType.quiz, difficulty: Difficulty.easy, topic: "JavaScript",
    question: "typeof null 的结果是？",
    options: ["A. \"object\"", "B. \"null\"", "C. \"undefined\"", "D. \"string\""],
    answer: "A. \"object\"",
    explanation: "这是 JavaScript 的一个历史遗留 bug，typeof null 返回 \"object\"。",
    xp: 50, gold: 20,
  },
  {
    careerSlug: "programming", title: "找出 Bug", description: "定位 JavaScript 错误。",
    type: TaskType.bug_fix, difficulty: Difficulty.medium, topic: "JavaScript",
    question: "下面的代码为什么输出 undefined？\n```js\nconst obj = { name: 'A' };\nconsole.log(obj.namee);\n```",
    options: null,
    answer: "属性名拼写错误：对象里是 name，代码访问的是 namee，所以得到 undefined。改为 obj.name 即可。",
    explanation: "访问不存在的属性不会报错而是返回 undefined。",
    xp: 75, gold: 30,
  },
  {
    careerSlug: "programming", title: "Git 提交", description: "版本控制基础。",
    type: TaskType.quiz, difficulty: Difficulty.easy, topic: "Git",
    question: "把改动保存到本地仓库的命令是？",
    options: ["A. git commit", "B. git push", "C. git add remote", "D. git clone"],
    answer: "A. git commit",
    explanation: "git add 先暂存，git commit 再提交到本地仓库，git push 推送到远程。",
    xp: 50, gold: 20,
  },
  {
    careerSlug: "programming", title: "数据结构：栈", description: "理解后进先出。",
    type: TaskType.quiz, difficulty: Difficulty.medium, topic: "数据结构",
    question: "栈（Stack）的特性是？",
    options: ["A. 后进先出(LIFO)", "B. 先进先出(FIFO)", "C. 随机访问", "D. 按键值查找"],
    answer: "A. 后进先出(LIFO)",
    explanation: "栈像叠盘子，后放的先取；队列才是 FIFO。",
    xp: 75, gold: 30,
  },
  {
    careerSlug: "programming", title: "算法复杂度", description: "理解大 O 表示法。",
    type: TaskType.short_answer, difficulty: Difficulty.medium, topic: "算法",
    question: "二分查找的时间复杂度是多少？为什么？",
    options: null,
    answer: "O(log n)。因为每次查找都把搜索区间减半。",
    explanation: "减半意味着最多需要 log2(n) 次比较。",
    xp: 75, gold: 30,
  },
  {
    careerSlug: "programming", title: "SQL 查询", description: "数据库基础。",
    type: TaskType.quiz, difficulty: Difficulty.medium, topic: "数据库",
    question: "从 users 表查询所有 name 以 A 开头的记录的 SQL 是？",
    options: ["A. SELECT * FROM users WHERE name LIKE 'A%'", "B. SELECT * FROM users WHERE name = 'A'", "C. SELECT * FROM users WHERE name STARTS A", "D. GET users WHERE name A*"],
    answer: "A. SELECT * FROM users WHERE name LIKE 'A%'",
    explanation: "LIKE 'A%' 表示以 A 开头，% 是通配符。",
    xp: 75, gold: 30,
  },
  {
    careerSlug: "programming", title: "API 设计", description: "理解 RESTful 设计。",
    type: TaskType.scenario, difficulty: Difficulty.hard, topic: "API",
    question: "设计一个「获取 id=5 用户」的 REST API，写出 HTTP 方法和路径。",
    options: null,
    answer: "GET /api/users/5",
    explanation: "用 GET 读取资源，路径用名词复数 + 资源 id。",
    xp: 100, gold: 40,
  },
  {
    careerSlug: "programming", title: "TypeScript 优势", description: "理解静态类型。",
    type: TaskType.short_answer, difficulty: Difficulty.medium, topic: "TypeScript",
    question: "TypeScript 相对 JavaScript 的一个核心优势是什么？",
    options: null,
    answer: "静态类型检查，能在编译期发现类型错误，提升代码可维护性与 IDE 提示体验。",
    explanation: "类型系统是 TS 最大的卖点。",
    xp: 75, gold: 30,
  },

  // 英语冒险家
  {
    careerSlug: "english", title: "字母音标", description: "基础发音。",
    type: TaskType.quiz, difficulty: Difficulty.easy, topic: "音标",
    question: "单词 \"cat\" 中的元音发音是？",
    options: ["A. /æ/", "B. /i:/", "C. /u:/", "D. /əʊ/"],
    answer: "A. /æ/",
    explanation: "cat 发 /kæt/，元音是短音 /æ/。",
    xp: 50, gold: 20,
  },
  {
    careerSlug: "english", title: "常用单词", description: "词汇积累。",
    type: TaskType.quiz, difficulty: Difficulty.easy, topic: "单词",
    question: "\"apple\" 的中文意思是？",
    options: ["A. 苹果", "B. 香蕉", "C. 橙子", "D. 葡萄"],
    answer: "A. 苹果",
    explanation: "apple = 苹果。",
    xp: 50, gold: 20,
  },
  {
    careerSlug: "english", title: "语法：一般现在时", description: "动词第三人称单数。",
    type: TaskType.quiz, difficulty: Difficulty.medium, topic: "语法",
    question: "选择正确的句子：",
    options: ["A. She goes to school every day.", "B. She go to school every day.", "C. She going to school every day.", "D. She gone to school every day."],
    answer: "A. She goes to school every day.",
    explanation: "第三人称单数主语 she 后动词用 goes。",
    xp: 75, gold: 30,
  },
  {
    careerSlug: "english", title: "餐厅点餐对话", description: "与 AI NPC 完成点餐。",
    type: TaskType.conversation, difficulty: Difficulty.medium, topic: "日常对话",
    question: "你在餐厅，服务员说 \"Hi! What can I get for you?\"，请用英语点一杯水和一份沙拉。",
    options: null,
    answer: "I'd like a bottle of water and a salad, please.",
    explanation: "AI 会从语法、词汇、表达自然度打分。",
    xp: 75, gold: 30,
  },
  {
    careerSlug: "english", title: "便利店对话", description: "AI 场景对话。",
    type: TaskType.conversation, difficulty: Difficulty.easy, topic: "日常对话",
    question: "进入便利店，店员说 \"Hi! What can I get for you?\"，请用英语回复你想买一瓶水。",
    options: null,
    answer: "I want a bottle of water.",
    explanation: "AI 会从语法、词汇、表达自然度打分。",
    xp: 50, gold: 20,
  },
  {
    careerSlug: "english", title: "阅读理解", description: "理解短文。",
    type: TaskType.quiz, difficulty: Difficulty.medium, topic: "阅读",
    question: "\"Tom likes to read books in the library.\" Tom 喜欢在哪里读书？",
    options: ["A. 图书馆", "B. 公园", "C. 家里", "D. 学校"],
    answer: "A. 图书馆",
    explanation: "library = 图书馆。",
    xp: 75, gold: 30,
  },
  {
    careerSlug: "english", title: "商务英语", description: "邮件表达。",
    type: TaskType.short_answer, difficulty: Difficulty.hard, topic: "商务英语",
    question: "用英语写一句礼貌的开场白，用于给客户发邮件。",
    options: null,
    answer: "I hope this email finds you well.",
    explanation: "这是商务邮件常见的礼貌开场白。",
    xp: 100, gold: 40,
  },
  {
    careerSlug: "english", title: "写作：自我介绍", description: "用英语自我介绍。",
    type: TaskType.short_answer, difficulty: Difficulty.medium, topic: "写作",
    question: "用 2-3 句英语介绍你自己（姓名、爱好）。",
    options: null,
    answer: "示例：My name is Tom. I like reading and coding.",
    explanation: "AI 会从语法、词汇、表达自然度打分。",
    xp: 75, gold: 30,
  },
  {
    careerSlug: "english", title: "口语：问路", description: "AI 场景对话。",
    type: TaskType.conversation, difficulty: Difficulty.medium, topic: "口语",
    question: "你想去火车站，用英语向路人问路。",
    options: null,
    answer: "Excuse me, could you tell me how to get to the train station?",
    explanation: "AI 会从语法、词汇、表达自然度打分。",
    xp: 75, gold: 30,
  },
  {
    careerSlug: "english", title: "语法：时态", description: "过去时。",
    type: TaskType.quiz, difficulty: Difficulty.medium, topic: "语法",
    question: "选择正确的过去时句子：",
    options: ["A. I went to the store yesterday.", "B. I go to the store yesterday.", "C. I gone to the store yesterday.", "D. I going to the store yesterday."],
    answer: "A. I went to the store yesterday.",
    explanation: "yesterday 是过去时间，动词用过去式 went。",
    xp: 75, gold: 30,
  },
];

// ─────────────────────────── 成就(20 个) ───────────────────────────
const achievements = [
  { slug: "first-task", name: "第一个任务", description: "完成第一项学习任务。", emoji: "🎯", conditionType: "task_count", conditionValue: 1, xpReward: 10, goldReward: 5 },
  { slug: "task-10", name: "学有所成", description: "完成 10 项学习任务。", emoji: "📚", conditionType: "task_count", conditionValue: 10, xpReward: 50, goldReward: 30 },
  { slug: "task-50", name: "勤学苦练", description: "完成 50 项学习任务。", emoji: "📚", conditionType: "task_count", conditionValue: 50, xpReward: 200, goldReward: 100 },
  { slug: "task-100", name: "百炼成钢", description: "完成 100 项学习任务。", emoji: "🏆", conditionType: "task_count", conditionValue: 100, xpReward: 500, goldReward: 250 },
  { slug: "streak-3", name: "连续学习 3 天", description: "连续签到 3 天。", emoji: "🔥", conditionType: "streak_days", conditionValue: 3, xpReward: 50, goldReward: 30 },
  { slug: "streak-7", name: "连续学习 7 天", description: "连续签到 7 天。", emoji: "🔥", conditionType: "streak_days", conditionValue: 7, xpReward: 100, goldReward: 60 },
  { slug: "streak-14", name: "连续学习 14 天", description: "连续签到 14 天。", emoji: "🔥", conditionType: "streak_days", conditionValue: 14, xpReward: 200, goldReward: 120 },
  { slug: "streak-30", name: "连续学习 30 天", description: "连续签到 30 天。", emoji: "🌟", conditionType: "streak_days", conditionValue: 30, xpReward: 500, goldReward: 300 },
  { slug: "streak-100", name: "连续学习 100 天", description: "连续签到 100 天。", emoji: "👑", conditionType: "streak_days", conditionValue: 100, xpReward: 2000, goldReward: 1000 },
  { slug: "first-checkin", name: "第一次签到", description: "完成第一次每日签到。", emoji: "✅", conditionType: "streak_days", conditionValue: 1, xpReward: 10, goldReward: 5 },
  { slug: "level-5", name: "达到 Lv.5", description: "角色等级达到 5 级。", emoji: "⚡", conditionType: "level_reach", conditionValue: 5, xpReward: 100, goldReward: 50 },
  { slug: "level-10", name: "达到 Lv.10", description: "角色等级达到 10 级。", emoji: "🏆", conditionType: "level_reach", conditionValue: 10, xpReward: 300, goldReward: 150 },
  { slug: "level-20", name: "达到 Lv.20", description: "角色等级达到 20 级。", emoji: "🌟", conditionType: "level_reach", conditionValue: 20, xpReward: 800, goldReward: 400 },
  { slug: "all-careers", name: "全能冒险家", description: "解锁全部 4 个职业。", emoji: "🏆", conditionType: "career_count", conditionValue: 4, xpReward: 500, goldReward: 250 },
  { slug: "invest-profit-10", name: "投资模拟盈利 10%", description: "投资模拟收益率达到 10%。", emoji: "💰", conditionType: "invest_profit", conditionValue: 10, xpReward: 100, goldReward: 50 },
  { slug: "ai-task-10", name: "AI 任务 x10", description: "完成 10 个 AI 动态任务。", emoji: "🤖", conditionType: "ai_task_count", conditionValue: 10, xpReward: 100, goldReward: 50 },
  { slug: "ai-task-50", name: "AI 任务 x50", description: "完成 50 个 AI 动态任务。", emoji: "🤖", conditionType: "ai_task_count", conditionValue: 50, xpReward: 500, goldReward: 250 },
  { slug: "bug-fix-100", name: "修复 100 个 Bug", description: "完成 100 个找 Bug 任务。", emoji: "💻", conditionType: "bug_fix_count", conditionValue: 100, xpReward: 500, goldReward: 250 },
  { slug: "first-english-chat", name: "第一次英语对话", description: "完成第一次 AI 英语对话。", emoji: "🇬🇧", conditionType: "chat_count", conditionValue: 1, xpReward: 50, goldReward: 25 },
  { slug: "chat-10", name: "社交达人", description: "完成 10 次 AI NPC 对话。", emoji: "💬", conditionType: "chat_count", conditionValue: 10, xpReward: 150, goldReward: 75 },
];

// ─────────────────────────── NPC(4 个导师) ───────────────────────────
const npcs = [
  {
    slug: "dr-lin", name: "林博士", emoji: "🧑‍🏫", title: "投资导师", careerSlug: "investing",
    greeting: "你好，冒险家！我是林博士。记住：这里的一切投资都是虚拟模拟，不构成真实投资建议。今天想学点什么？",
    systemPrompt: "你是投资导师「林博士」，一位严谨、耐心的金融老师。根据玩家等级调整讲解深度：低等级用通俗比喻，高等级用专业术语。所有内容仅用于虚拟学习模拟，必须声明不构成投资建议。",
  },
  {
    slug: "nova", name: "Nova", emoji: "🤖", title: "AI 导师", careerSlug: "ai",
    greeting: "Hi，我是 Nova！让我们一起探索 LLM、Prompt 和 Agent 的世界吧。",
    systemPrompt: "你是 AI 导师「Nova」，热情、清晰。根据玩家等级讲解 AI 概念：低等级用类比，高等级讲原理与代码。",
  },
  {
    slug: "code", name: "Code", emoji: "👨‍💻", title: "编程导师", careerSlug: "programming",
    greeting: "嘿，我是 Code！准备好写出你的第一行代码了吗？",
    systemPrompt: "你是编程导师「Code」，鼓励式教学。根据玩家等级出题与讲解，注重动手实践与调试思路。",
  },
  {
    slug: "emma", name: "Emma", emoji: "👩‍🏫", title: "英语导师", careerSlug: "english",
    greeting: "Hi! I'm Emma. Let's practice English together! 别紧张，我们慢慢来。",
    systemPrompt: "你是英语导师「Emma」，友好耐心。全程用英语对话并适当用中文提示，根据玩家水平调整难度，及时纠正语法并给出鼓励。",
  },
];

// ─────────────────────────── 地图区域 ───────────────────────────
const mapAreas = [
  { slug: "village", name: "新手村", emoji: "🏠", description: "冒险的起点，认识游戏系统。", minLevel: 1, order: 1, locked: false },
  { slug: "library", name: "知识图书馆", emoji: "📚", description: "海量知识的宝库。", minLevel: 1, order: 2, locked: false },
  { slug: "invest-city", name: "投资城", emoji: "📈", description: "虚拟金融市场，学习投资分析。", minLevel: 1, order: 3, locked: false },
  { slug: "ai-lab", name: "AI 实验室", emoji: "🤖", description: "探索大模型与智能体。", minLevel: 1, order: 4, locked: false },
  { slug: "code-forest", name: "编程森林", emoji: "💻", description: "穿越代码的丛林。", minLevel: 1, order: 5, locked: false },
  { slug: "english-town", name: "英语小镇", emoji: "🇬🇧", description: "与 Emma 一起练习英语。", minLevel: 1, order: 6, locked: false },
  { slug: "arena", name: "挑战竞技场", emoji: "🏆", description: "与其他冒险家一较高下。", minLevel: 3, order: 7, locked: true },
  { slug: "ai-tower", name: "AI 导师塔", emoji: "🧙", description: "与 AI 导师深入对话。", minLevel: 2, order: 8, locked: true },
  { slug: "future", name: "后续区域", emoji: "🔒", description: "敬请期待更多冒险。", minLevel: 99, order: 9, locked: true },
];

// ─────────────────────────── 主流程 ───────────────────────────
async function main() {
  console.log("🌱 开始写入种子数据...");

  // 职业
  for (const c of careers) {
    await prisma.career.upsert({
      where: { slug: c.slug },
      update: { name: c.name, emoji: c.emoji, description: c.description, color: c.color, topics: c.topics, order: c.order },
      create: c,
    });
  }

  // 技能
  const skills = buildSkills();
  for (const s of skills) {
    const career = await prisma.career.findUniqueOrThrow({ where: { slug: s.careerSlug } });
    await prisma.skill.upsert({
      where: { careerId_slug: { careerId: career.id, slug: s.slug } },
      update: { name: s.name, description: s.description, tier: s.tier, levelRequirement: s.levelRequirement, xpReward: s.xpReward, prerequisites: s.prerequisites, positionX: s.positionX, positionY: s.positionY },
      create: { careerId: career.id, slug: s.slug, name: s.name, description: s.description, tier: s.tier, levelRequirement: s.levelRequirement, xpReward: s.xpReward, prerequisites: s.prerequisites, positionX: s.positionX, positionY: s.positionY },
    });
  }

  // 任务(幂等: 已存在则跳过, 避免重复插入)
  const taskCount = await prisma.task.count();
  if (taskCount === 0) {
    for (const t of tasks) {
      const career = await prisma.career.findUniqueOrThrow({ where: { slug: t.careerSlug } });
      await prisma.task.create({
        data: {
          careerId: career.id,
          title: t.title,
          description: t.description,
          type: t.type,
          difficulty: t.difficulty,
          question: t.question,
          options: t.options ?? Prisma.JsonNull,
          answer: t.answer,
          explanation: t.explanation,
          xp: t.xp,
          gold: t.gold,
          topic: t.topic,
        },
      });
    }
  }

  // 成就
  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { slug: a.slug },
      update: { name: a.name, description: a.description, emoji: a.emoji, conditionType: a.conditionType, conditionValue: a.conditionValue, xpReward: a.xpReward, goldReward: a.goldReward },
      create: a,
    });
  }

  // NPC
  for (const n of npcs) {
    const career = n.careerSlug ? await prisma.career.findUnique({ where: { slug: n.careerSlug } }) : null;
    await prisma.nPC.upsert({
      where: { slug: n.slug },
      update: { name: n.name, emoji: n.emoji, title: n.title, greeting: n.greeting, systemPrompt: n.systemPrompt, careerId: career?.id ?? null },
      create: { slug: n.slug, name: n.name, emoji: n.emoji, title: n.title, greeting: n.greeting, systemPrompt: n.systemPrompt, careerId: career?.id ?? null },
    });
  }

  // 地图区域
  for (const m of mapAreas) {
    await prisma.mapArea.upsert({
      where: { slug: m.slug },
      update: { name: m.name, emoji: m.emoji, description: m.description, minLevel: m.minLevel, order: m.order, locked: m.locked },
      create: m,
    });
  }

  // 测试用户
  const demoPassword = await bcrypt.hash("demo1234", 10);
  const demo = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      username: "demo",
      email: "demo@example.com",
      passwordHash: demoPassword,
      avatar: "🧑‍🚀",
      level: 3,
      xp: 300,
      gold: 150,
      hp: 100,
      streakDays: 2,
      tasksCompleted: 5,
    },
  });

  // 给测试用户解锁投资职业 + 前两个技能
  const investingCareer = await prisma.career.findUniqueOrThrow({ where: { slug: "investing" } });
  await prisma.userCareer.upsert({
    where: { userId_careerId: { userId: demo.id, careerId: investingCareer.id } },
    update: {},
    create: { userId: demo.id, careerId: investingCareer.id, level: 2, xp: 120, isActive: true },
  });
  const firstSkills = await prisma.skill.findMany({ where: { careerId: investingCareer.id, tier: { lte: 2 } } });
  for (const sk of firstSkills) {
    await prisma.userSkill.upsert({
      where: { userId_skillId: { userId: demo.id, skillId: sk.id } },
      update: {},
      create: { userId: demo.id, skillId: sk.id },
    });
  }

  // 少量学习记录, 让排行榜有数据
  const demoRecords = [
    { activityType: ActivityType.task_completed, xpEarned: 50, goldEarned: 20, minutesSpent: 5 },
    { activityType: ActivityType.checkin, xpEarned: 20, goldEarned: 10, minutesSpent: 1 },
    { activityType: ActivityType.chat, xpEarned: 15, goldEarned: 0, minutesSpent: 3 },
  ];
  for (const r of demoRecords) {
    await prisma.learningRecord.create({ data: { userId: demo.id, careerId: investingCareer.id, ...r } });
  }

  const counts = {
    careers: await prisma.career.count(),
    skills: await prisma.skill.count(),
    tasks: await prisma.task.count(),
    achievements: await prisma.achievement.count(),
    npcs: await prisma.nPC.count(),
    mapAreas: await prisma.mapArea.count(),
  };
  console.log("✅ 种子数据写入完成:", counts);
}

main()
  .catch((e) => {
    console.error("❌ 种子数据写入失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
