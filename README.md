# 奇门打工人

古色古香的 H5/PWA MVP，包含「此刻 / 问事 / 我」三个页面、本地问事历史、规则驱动基础排盘、高风险拦截、九宫原盘和 Canvas 今日卡。

## 本地运行（Windows PowerShell）

本项目不要求全局安装 pnpm，直接使用系统自带的 npm：

```powershell
cd D:\DSH\qimen
npm install --ignore-scripts
npm run dev
```

浏览器打开终端显示的地址（一般为 `http://localhost:5173`）。

## 生产构建

```powershell
npm run build
```

输出在 `dist/`。

## 数据源

- `src/data/rules.json`：排盘常量与打分规则
- `src/data/copy-zh.json`：界面与解读文案

> 传统文化娱乐参考，不构成任何决策建议。
