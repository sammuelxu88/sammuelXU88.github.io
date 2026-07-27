# GitHub Pages 发布准备结果

完成日期：2026-07-27

## 已完成

- 保留全部原始 JPG、PNG、GIF、MP4 素材，不覆盖、不删除。
- 为首页封面生成 1200 x 1200 的 WebP 发布副本。
- 为详情页图片生成最长边不超过 2560 px、质量 82% 的 WebP 发布副本。
- 185 张图片由 410.1 MiB 压缩至 20.8 MiB。
- 项目数据已更新为使用 `/optimized/` 下的发布副本。
- 本地 CMS 和 `/api/cms/projects` 保持可用。
- GitHub Pages 构建会自动隐藏 CMS 入口，并排除 CMS 页面与写入 API。
- GitHub Pages 构建只复制实际引用的素材，原始素材不会进入公开发布包。
- 已添加 GitHub Actions 自动部署流程。

## 验证结果

- 本地完整版本构建通过：47 个页面，包含 40 个项目详情页、CMS 和 API。
- GitHub Pages 静态版本构建通过：45 个页面，包含首页、简历页、40 个项目详情页等。
- 静态输出目录：`out/`
- 静态输出大小：75.75 MiB，共 609 个文件。
- 静态输出不包含 `/cms`。
- 静态输出包含 `.nojekyll`。
- 浏览器实测：首页 Three.js 画布正常，CMS 链接为 0，控制台无错误。
- 浏览器实测：简历页与详情页图片均正常加载，无破图。

## 视频说明

当前两段 MP4 保持原文件，其中较大的视频约 47.87 MiB。由于本机暂未安装可靠的视频编码器，本轮没有对视频做有损重编码。该文件仍低于 GitHub 单文件 100 MB 限制，可正常发布；如后续视频继续增加，建议安装 FFmpeg 后统一转为 H.264/AAC，并控制单段在 30-50 MiB 内。

## 本地使用

```powershell
npm.cmd run dev
```

本地 CMS 仍通过 `/cms` 使用。

## 重新生成发布图片

仅在项目数据仍指向原始素材、或新增项目后执行：

```powershell
npm.cmd run optimize:media
```

## 生成 GitHub Pages 发布包

```powershell
npm.cmd run build:pages
```

生成结果位于 `out/`。推荐把 GitHub 仓库命名为 `<你的GitHub用户名>.github.io`，这样网站从域名根目录发布，现有素材绝对路径无需额外改写。

## GitHub 设置

1. 创建公开仓库，推荐名称为 `<用户名>.github.io`。
2. 将本项目推送到仓库的 `main` 分支。
3. 在仓库 `Settings > Pages` 中将 Source 设为 `GitHub Actions`。
4. 打开 Actions，等待 `Deploy portfolio to GitHub Pages` 完成。
5. 以后在本地 CMS 更新作品，保存项目文件后提交并推送；工作流会自动重新发布。

## 关键文件

- `.github/workflows/deploy-pages.yml`：自动部署流程。
- `scripts/build-github-pages.mjs`：静态发布构建与本地 CMS 隔离。
- `scripts/optimize-publish-assets.mjs`：图片发布副本生成器。
- `deployment-audit/optimized-assets-manifest.json`：压缩前后文件清单。
- `deployment-audit/projects-before-media-optimization.json`：更新项目数据前的备份。
