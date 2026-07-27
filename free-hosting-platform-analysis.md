# 个人作品集免费部署平台评估

更新日期：2026-07-21

## 结论

推荐采用 **Cloudflare Pages + Cloudflare R2**：

- Cloudflare Pages 托管静态网页、JavaScript、CSS、字体和小于 25 MiB 的图片。
- Cloudflare R2 托管项目视频和较大的原图。
- CMS 可部署为动态管理页面；项目文案存入 D1，图片和视频存入 R2，网页代码更新时再从本地重新发布。
- 按当前预计访问量低于 1,000 人/月，以及未来约 1.2-1.9 GB 的网站与媒体总量估算，正常情况下月费用为 **0 元**。

这是当前最适合本项目长期维持免费、又不容易因视频流量突然停站的组合。

## 是否只能部署静态网页

不是。Cloudflare Pages 的基础部分用于静态网页，但可以配合 **Pages Functions / Cloudflare Workers** 执行服务端代码，因此也能实现 API、登录验证、动态路由、表单提交和 CMS。Functions 可以绑定 R2、D1、KV 与 Durable Objects 等 Cloudflare 服务。

对于 Next.js，Cloudflare 官方当前建议：纯静态 Next.js 使用 Pages；需要完整 SSR 和全栈 Next.js 能力时使用 Cloudflare Workers。

本作品集有三种部署层级：

1. **推荐的动态免费模式**：Pages/Workers 提供页面与 API，D1 保存项目文案，R2 保存媒体，管理员在线登录和上传。符合当前“免费优先、可以动态页面”的要求。
2. **最简静态模式**：公开作品页静态部署到 Pages，图片和视频放 R2，本地 CMS 更新后重新发布。改造较少，但不支持在线修改作品。
3. **完整动态 Next.js 模式**：将整个 Next.js 应用部署到 Cloudflare Workers，支持 SSR/API；复杂度和资源消耗最高，本项目目前没有必要。

当前 CMS 的服务端接口直接修改项目文件。这种写入方式不能原样搬到无状态的 Pages Functions/Workers，因为线上运行环境没有可永久修改的项目磁盘。若以后需要在线 CMS，应改为：项目数据写入 D1，图片和视频写入 R2，密码通过加密哈希与安全会话验证。

## 首页和简历页动效兼容性结论

当前项目中的视觉动效都在访问者浏览器中运行：

- 首页作品墙：Three.js / WebGL、`requestAnimationFrame`、鼠标拖动与透视变化。
- 首页背景：Canvas 动画。
- 简历封面：`PORTFOLIO COLLECTION` Shuffle 字符动画。
- 简历技能：环形进度动画和 CSS 入场动画。

这些都属于客户端视觉动效，并不依赖 SSR、在线数据库或长期运行的服务器。**Cloudflare Pages + R2 就可以完整展示首页和简历页现有动效**，GitHub Pages、Netlify 和 Vercel 的静态托管同样可以运行；平台只负责发送 HTML、JavaScript、CSS 和媒体文件，动画由浏览器执行。

最终选择应按内容管理需求区分：

| 需求 | 推荐部署 |
|---|---|
| 保留全部首页与简历页动效，本地修改作品后重新发布 | **Cloudflare Pages + R2** |
| 保留全部动效，并允许在线 CMS 即时新增、修改和删除项目 | **Cloudflare Pages/Workers + D1 + R2** |
| 需要 Next.js SSR、请求时生成页面或复杂服务端逻辑 | **Cloudflare Workers + D1 + R2** |

对本项目而言，视觉动效不是采用 Workers 的理由。只有“在线 CMS 无需重新发布即可更新内容”才需要 Workers 和 D1。若优先免费、稳定和低维护，建议先部署 **Cloudflare Pages + R2**；以后需要在线 CMS 时再增加 Workers + D1，不必重做首页和简历页动画。

## 当前项目情况

- 技术：Next.js 16、React 19、Three.js / React Three Fiber。
- 当前 `public` 素材约 294 个文件、约 313 MB。
- 页面已有动态项目路由，并提供静态参数，适合生成静态详情页。
- CMS 目前包含本地写入接口，不能直接部署到纯静态平台；建议保留为本地管理工具。
- 公开版需要启用 Next.js 静态导出，并在构建公开版时排除 `/cms` 和 `/api/cms`。

## 修正后的素材规模估算

按 48 个项目、每个项目 5 张图片，以及全站共 10 个 60 MB 视频估算：

- 视频：10 × 60 MB = 600 MB，约 0.59 GB。
- 图片：240 张，按每张 2-4 MB 估算，约 0.47-0.94 GB。
- 网页代码、字体、封面及其他资源：约 0.15-0.35 GB。
- 总量：约 1.2-1.9 GB。

建议上线前将普通图片转换为 WebP/AVIF，并对 MP4 使用 H.264 编码和 `faststart`，降低首屏加载与流量消耗。

## 平台对比

| 方案 | 免费情况 | 对本项目的适合度 | 主要限制 |
|---|---:|---|---|
| Cloudflare Pages/Workers + D1 + R2 | 预计 0 元/月 | **最推荐，可动态更新** | 需要把当前文件写入式 CMS 改为数据库和对象存储 |
| Vercel Hobby + R2 | 预计 0 元/月 | 推荐，部署 Next.js 最简单 | Hobby 仅限个人、非商业用途；大媒体仍应外置 |
| GitHub Pages + R2 | 预计 0 元/月 | 可用 | Pages 站点上限 1 GB；需要静态导出，仓库通常公开 |
| Netlify Free + R2 | 预计 0 元/月 | 可用但不优先 | 每月仅 300 credits，达到上限后整站暂停 |
| Firebase Hosting | 有条件免费 | 不推荐直接放视频 | 免费传输只有 10 GB/月，视频很容易耗尽额度 |

## 方案一：Cloudflare Pages/Workers + D1 + R2

### 免费额度

Cloudflare Pages 免费计划包含每月 500 次构建、每站最多 20,000 个文件，单个静态资源最大 25 MiB。R2 Standard 每月免费包含 10 GB-month 存储、100 万次 A 类操作、1,000 万次 B 类操作，并且公网流量出口免费。

### 对本项目的结果

- 预计 1.2-1.9 GB 网站与媒体量明显低于 R2 的 10 GB 免费存储额度。
- 低于 1,000 人/月的访问规模远低于免费请求额度。
- 60 MB 视频不符合 Pages 的 25 MiB 单文件限制，但放入 R2 后没有这个问题。
- R2 免费出口流量让视频播放比 Firebase、Netlify 更不容易触发免费额度停站。

### 免费动态能力

- Workers / Pages Functions：每天 100,000 次免费请求，每次最多 10 ms CPU 时间。低于 1,000 位访客/月的作品集通常有充分余量。
- D1：每天 500 万行读取、100,000 行写入，并包含 5 GB 免费数据库存储。48 个项目的文案、分类、排序和媒体索引占用极小。
- R2：10 GB-month 免费存储、每月 100 万次写入类操作、1,000 万次读取类操作，公网出口流量免费。

因此可以实现动态项目详情页、在线 CMS 登录、项目增删改、封面排序、图片与视频上传，同时继续优先维持 0 元费用。

### 注意事项

- 开通 R2 通常需要完成 Cloudflare 的订阅/结算设置，即使实际用量在免费额度内仍为 0 元。
- 没有自定义域名时，可通过免费 Cloudflare Worker 的 `workers.dev` 地址读取 R2；不建议把限速的开发用 `r2.dev` 地址作为正式媒体地址。
- 若未来素材超过 10 GB，R2 Standard 超出部分按约 0.015 美元/GB-month 计费，仍然较低。

## 方案二：Vercel Hobby + R2

Vercel Hobby 免费提供 Next.js 原生部署、自动 HTTPS、Git 自动发布和每月 100 GB Fast Data Transfer。它是现有 Next.js 项目最容易接入的选项。

适用条件：作品集是个人求职、非商业项目。Vercel 明确限制 Hobby 为个人、非商业用途；若网站以后用于商业工作室、接单或团队业务，应改用 Cloudflare Pages 或付费 Vercel Pro。

建议仍把视频和大图放 R2，避免部署体积和 Vercel 流量额度成为问题。

## 方案三：GitHub Pages + R2

GitHub Pages 对公开仓库免费，适合纯静态作品集。官方限制发布站点不超过 1 GB，并有每月 100 GB 的软带宽限制。

当前约 313 MB 的公开素材可以部署，但未来 6 GB 以上素材不能直接放 Pages。使用 R2 存媒体后可以继续保持免费。缺点是必须完成 Next.js 静态导出，而且免费 Pages 通常意味着源码仓库公开。

## 方案四：Netlify Free + R2

Netlify Free 当前为每月 300 credits。正式发布每次消耗 15 credits，带宽每 GB 消耗 20 credits，网页请求每 10,000 次消耗 2 credits。额度耗尽后项目会暂停到下个周期。

如果媒体全部放 R2、每月只发布少数几次，免费额度通常够用；但它比 Cloudflare Pages 更容易因为部署次数或网页流量停站，因此不作为首选。

## 方案五：Firebase Hosting

Firebase Hosting 免费存储上限为 10 GB，单文件最大 2 GB，因此容量和 60 MB 视频本身都可以接受；但免费数据传输仅 10 GB/月。大约 170 次完整播放 60 MB 视频就可能用完 10 GB，之后免费站点可能暂停。因此不建议把本项目视频直接放 Firebase Hosting。

## 建议的动态部署结构

```text
Cloudflare Pages / Workers
├─ 首页、简历页、项目详情页
├─ CMS 登录与管理界面
└─ 动态 API
       │
       ├─ 项目文案、分类、排序 → Cloudflare D1
       └─ 封面、大图、GIF、MP4 → Cloudflare R2

本地电脑
├─ 修改网页代码并重新发布
└─ 保留项目数据和媒体备份
```

## 实施建议

1. 将当前 Next.js 项目适配 Cloudflare Workers；纯静态资源仍由 Cloudflare CDN 提供。
2. 将当前 `/api/cms/projects` 的项目文件写入改为 D1 数据库读写。
3. 将图片、GIF 和 MP4 导入/删除功能改为 R2 对象存储操作。
4. CMS 密码不能继续以前端明文保存，应改为服务端哈希验证、安全 Cookie 和登录限流。
5. 保留本地 JSON 导出和媒体备份，以便迁移及灾难恢复。
6. 为视频设置封面图、延迟加载和用户点击后播放，避免页面打开时下载全部视频。

## 官方资料

- Cloudflare Pages limits: https://developers.cloudflare.com/pages/platform/limits/
- Cloudflare R2 pricing: https://developers.cloudflare.com/r2/pricing/
- Cloudflare R2 setup: https://developers.cloudflare.com/r2/get-started/
- Cloudflare Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare D1 pricing: https://developers.cloudflare.com/d1/platform/pricing/
- Vercel Hobby plan: https://vercel.com/docs/plans/hobby
- Vercel limits: https://vercel.com/docs/limits
- GitHub Pages limits: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- Netlify pricing: https://www.netlify.com/pricing/
- Netlify credit plans: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/
- Firebase Hosting usage and pricing: https://firebase.google.com/docs/hosting/usage-quotas-pricing
