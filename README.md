# MyHair – Your Hair, Your Way 💇

> 实时 AI 发型编辑器 · GitHub Pages 部署

一个运行在浏览器中的实时发型模拟工具。拍照或上传图片，AI 分析你的发型特征，然后用滑块实时调节长度、卷度、颜色和刘海，找到最适合自己的造型。

![MyHair Screenshot](assets/preview.png)

## ✨ 功能

- **📸 摄像头 / 图片上传** — 无需安装 App，浏览器直接拍照
- **🤖 AI 发型分析** — 自动检测发量、发色、长度、发质
- **🎨 实时发型编辑** — Canvas 2D 实时渲染，拖动滑块即时预览
  - 长度调节（超短 → 及腰长发）
  - 卷度调节（直发 → 大波浪）
  - 发量调节（扁塌 → 蓬松）
  - 刘海调节（无刘海 → 厚刘海）
- **💇 8 种发型预设** — Bob、长直发、卷发、丸子头、马尾、层次长发等
- **🎨 10 种发色** — 自然黑、深棕、焦糖棕、金色、酒红、紫调等
- **💾 下载分享** — 一键保存发型预览图

## 🔬 技术基础

本项目受以下学术研究启发：

| 论文 | 机构 | 链接 |
|------|------|------|
| GaussianHaircut | ETH AIT | [GitHub](https://github.com/eth-ait/GaussianHaircut) |
| Neural Haircut | ArXiv | [2306.05872](https://arxiv.org/abs/2306.05872) |
| GaussianHair | ArXiv | [2402.10483](https://arxiv.org/abs/2402.10483) |
| HAAR | ArXiv | [2312.11666](https://arxiv.org/abs/2312.11666) |

## 🚀 部署

### GitHub Pages（推荐）

```bash
# Fork 或 Clone 本仓库
git clone https://github.com/YOUR_USERNAME/myhair.git
cd myhair

# 推送到 GitHub
git push origin main

# 在 GitHub 仓库设置中开启 Pages（Settings → Pages → Branch: main）
```

访问 `https://YOUR_USERNAME.github.io/myhair/`

### 本地运行

```bash
# 直接双击 index.html，或用本地服务器（推荐，避免摄像头权限限制）
npx serve .
# 或
python3 -m http.server 8080
```

访问 `http://localhost:8080`

## 📁 项目结构

```
myhair/
├── index.html          # 主入口（单页 SPA）
├── css/
│   └── style.css       # 全局样式（深色主题 + 紫色渐变）
├── js/
│   ├── presets.js      # 发型预设数据 + 发色数据
│   ├── hair-renderer.js# Canvas 发型渲染引擎（核心）
│   ├── camera.js       # 摄像头 / 图片上传模块
│   └── app.js          # 主应用逻辑 + 页面路由
├── assets/             # 图标 / 示例图片
└── README.md
```

## 🛣️ 路线图

- [ ] 接入真实 GaussianHaircut 推理 API
- [ ] 3D 头型旋转预览
- [ ] 理发师预约集成
- [ ] 社区分享功能
- [ ] L'Oréal 产品联动推荐

## 📄 License

MIT · Team Eayment (Wendy Wu, Dawn Deng & Kising Zhang)
