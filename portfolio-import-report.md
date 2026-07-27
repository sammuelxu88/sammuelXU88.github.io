# 作品集素材整理报告

## 本次结果

- 来源目录：`D:\Samuel-工作文件夹\练习文件【源文件找淮情免费领取】\作品集`
- 项目数量：40 个（一个文件夹对应一个项目）
- 已整理媒体：183 个
- 视频：2 个
- PSD：3 个，按要求未处理、未导入网站
- 首页结构：5 行 × 8 列，共 40 张唯一的 1:1 项目封面
- 详情页：展示项目文件夹内除封面外的全部可用图片和视频

## 本地位置

- 项目资料：`content/projects.json`
- 网站素材：`public/portfolio/organized`
- 整理脚本：`scripts/import-portfolio.mjs`

## 后续更新

源文件夹内容更新后，在项目目录运行：

```powershell
node scripts/import-portfolio.mjs
npm.cmd run build
```

整理脚本会重新生成 40 个项目的数据和网站素材；PSD 始终跳过。
