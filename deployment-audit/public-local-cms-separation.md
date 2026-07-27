# 公开版本与本地 CMS 隔离

## 本地版本

- 使用 `npm run dev` 启动。
- 保留 `/cms`。
- 保留 `/api/cms/projects`，可写入项目资料与上传素材。

## 公开版本

- 使用 `npm run build:public` 构建。
- 构建时临时排除 `app/cms` 和 `app/api`，完成后自动恢复本地源码。
- 导出的 `out` 目录不包含 `/cms`、`/api/cms/projects` 或首页 CMS 入口。
- GitHub Pages 自动部署流程已固定使用公开构建命令。
