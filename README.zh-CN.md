# ModelX Web

> AI 模型目录前端 — 浏览、对比和搜索 60+ 提供商的模型。

数据来源：[modelx-data](https://github.com/anyllmtoken/modelx-data) — 每日发布为 [`@anyllmtoken/modelx-data`](https://www.npmjs.com/package/@anyllmtoken/modelx-data) npm 包。

## 技术栈

- [Next.js](https://nextjs.org) 16（App Router, Turbopack）
- [React](https://react.dev) 19
- [Tailwind CSS](https://tailwindcss.com) 4
- [Vercel](https://vercel.com) 部署

## 开发

从 monorepo 根目录运行：

```bash
pnpm dev:web
```

或从当前目录：

```bash
pnpm dev
```

## 环境变量

在根目录创建 `.env` 文件：

```env
SITE_URL=http://localhost:3000
```

## 许可

MIT
