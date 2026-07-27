# GitHub Pages 部署操作指南

适用项目：`D:\Samuel-工作文件夹\codex-web`  
整理日期：2026-07-24

## 推荐方式

创建 GitHub 用户主页仓库：

`<你的GitHub用户名>.github.io`

发布地址将是：

`https://<你的GitHub用户名>.github.io/`

推荐用户主页仓库而不是普通仓库，原因是当前网站大量素材使用 `/portfolio/...`、`/resume-assets/...` 这类根路径。部署到域名根目录可避免统一添加仓库子路径，详情页和图片路径更稳定。

## 部署前必须调整

### 1. 将公开站改为静态导出

在 `next.config.mjs` 中加入：

```js
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

执行 `npm run build` 后，Next.js 会生成 `out` 文件夹。GitHub Pages 实际发布的是 `out`，不是项目源码目录。

### 2. 公开版排除 CMS 服务端接口

GitHub Pages 只能运行 HTML、CSS、JavaScript 和浏览器端 WebGL，不能运行：

- `app/api/cms/projects/route.js`
- 服务端写文件
- 在线 CMS 保存接口

建议保留当前本地 CMS 工程，同时建立“公开发布模式”：发布构建时不包含 `/api/cms/projects`，最好也不公开 `/cms` 页面。每次在本地 CMS 修改完成后，重新构建并推送即可。

首页 Three.js 作品墙、拖拽交互、简历页标题 Shuffle、动态进度环和详情页图片缩放均为浏览器端效果，可以完整保留。

### 3. 控制素材体积

当前实际引用素材约 460.69 MiB，低于 GitHub Pages 1 GB 的站点上限，但仍有明显风险：

- 74.42 MiB 单张 JPG
- 47.87 MiB MP4
- 29.05 MiB 单张 JPG
- 多张 18-21 MiB 图片

建议先将大图转为 WebP/AVIF，并把首页封面独立压缩为 1:1 缩略图。否则中国大陆访问速度会很慢，也会快速消耗 GitHub Pages 每月 100 GB 的软带宽额度。

## GitHub 操作步骤

### 第一步：注册并登录 GitHub

访问 `https://github.com`，确认自己的用户名。后续仓库名称必须与用户名完全对应。

### 第二步：创建公开仓库

1. 点击右上角 `+`。
2. 选择 `New repository`。
3. Repository name 填写：`<用户名>.github.io`。
4. Visibility 选择 `Public`。GitHub Free 的 Pages 免费发布通常使用公开仓库。
5. 创建仓库。

### 第三步：将本地项目提交到仓库

第一次上传时，在项目目录执行：

```powershell
git init
git add .
git commit -m "Initial portfolio release"
git branch -M main
git remote add origin https://github.com/<用户名>/<用户名>.github.io.git
git push -u origin main
```

上传前必须准备 `.gitignore`，至少排除：

```text
node_modules/
.next/
out/
deployment-audit/used-assets-backup-*/
*.log
```

独立素材备份不要推送到 GitHub，以免仓库重复增加约 460 MiB。

### 第四步：配置 GitHub Actions 自动发布

在项目中创建 `.github/workflows/deploy-pages.yml`：

```yaml
name: Deploy portfolio to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build static site
        run: npm run build

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v4
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 第五步：开启 Pages

1. 打开 GitHub 仓库。
2. 进入 `Settings`。
3. 左侧选择 `Pages`。
4. 在 `Build and deployment` 中将 `Source` 设为 `GitHub Actions`。
5. 推送代码后进入 `Actions` 查看构建状态。
6. 构建成功后访问 `https://<用户名>.github.io/`。

## 更新作品流程

以后更新不需要在线 CMS：

1. 启动本地网站和本地 CMS。
2. 编辑项目、图片、封面和文案并保存。
3. 在本机执行 `npm run build`，确认静态导出成功。
4. 提交并推送：

```powershell
git add .
git commit -m "Update portfolio projects"
git push
```

GitHub Actions 会自动重新构建并覆盖线上版本。

## 发布后检查

依次检查：

1. 首页作品墙能否加载并上下左右拖动。
2. 40 个项目卡片能否打开详情页。
3. 详情页刷新后是否仍能正常显示。
4. 简历页背景、标题动画和进度环是否工作。
5. 图片、GIF、MP4 是否可播放。
6. 手机与电脑上的文字、导航是否被遮挡。
7. 浏览器控制台是否出现图片 404 或脚本路径错误。

## 重要限制

- GitHub Pages 是静态托管，不支持本地 CMS 写入接口。
- 发布站点最大 1 GB；当前约 460.69 MiB，虽未超限但偏大。
- 每月软带宽上限约 100 GB。若每次访问平均下载 50 MiB，约 2,000 次完整访问即可接近该额度。
- GitHub Pages 没有中国大陆节点或大陆访问 SLA，部分网络环境可能慢或不稳定。
- 作品集展示可以使用 GitHub Pages，但不应把它当作交易、电商或在线 SaaS 服务。
- GitHub 仓库普通 Git 对单文件还有额外限制；大素材必须先压缩，避免将历史备份推送到仓库。

## 官方文档

- GitHub Pages 自定义工作流：https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- 配置发布源：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- GitHub Pages 限制：https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- Next.js 静态导出：https://nextjs.org/docs/app/guides/static-exports

## 当前项目判断

项目可以改造成 GitHub Pages 版本，且首页与简历动效可以保留。当前的两个主要阻碍是：

1. CMS 写入 API 与纯静态导出冲突，需要建立公开发布模式。
2. 素材过大，虽然总量未超过 1 GB，但会严重影响大陆访问速度和流量额度。

推荐顺序：先压缩素材，再增加静态发布配置和 GitHub Actions，最后创建用户主页仓库并发布。
