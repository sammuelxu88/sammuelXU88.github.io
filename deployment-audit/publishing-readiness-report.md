# Sammuel XU Portfolio 发布与素材审计报告

审计日期：2026-07-24  
审计范围：`D:\Samuel-工作文件夹\codex-web` 当前代码、40 个项目数据、公开页面实际引用素材、生产构建与免费部署可行性。

## 结论

当前网站技术上可以完整发布。生产构建已通过，首页、简历页、40 个项目详情页均可预生成；首页 Three.js/WebGL 作品墙、拖拽浏览、简历标题 Shuffle、动态进度环等效果均在访客浏览器中执行，放到静态托管后仍可保留。

但“永久免费”和“保证中国大陆稳定访问”无法同时严格承诺。最接近需求的方案是：

1. 本地保留 CMS 和写入接口，编辑完成后重新生成并发布公开站点。
2. 首选腾讯云 CloudBase 静态托管的免费体验环境进行低流量发布；容量上当前引用素材约 460.69 MiB，低于其 1 GB 静态空间额度。
3. 若需要可长期承诺的大陆稳定性，应准备备案域名并使用大陆节点；这通常会产生域名、备案配套或超额流量费用，不应宣称永久免费。
4. 腾讯 EdgeOne Pages 可作为免费测试候选，能承载 Next.js 与前端动效；但免费公测政策可能调整，且未备案域名不能使用中国大陆区域，因此不能作为“大陆稳定访问”的正式保证。
5. 不推荐 Cloudflare Pages + R2 作为本项目的大陆稳定方案。Cloudflare Pages 不直接提供中国大陆网络服务，其中国网络需要企业方案、单独订阅和备案；当前素材还包含超过 Workers 静态资产 25 MiB 单文件限制的文件。

在公开发布前，必须先处理版权来源和大文件优化。当前最大的风险不是技术，而是素材授权链不完整。

## 当前技术

| 部分 | 当前实现 | 发布影响 |
|---|---|---|
| 框架 | Next.js 16.2.10、React 19 | 可静态预生成，也可部署到 Next.js 运行时 |
| 3D 作品墙 | Three.js 0.185.1、React Three Fiber 9.6.1、WebGL | 浏览器端运行，静态托管可保留 |
| 动效 | React 客户端逻辑、Canvas、CSS 动画 | 静态托管可保留 |
| 项目页 | 40 条数据，`generateStaticParams` 生成详情页 | 可预生成完整详情页 |
| CMS | `/cms` + `/api/cms/projects` 写入本地项目文件 | 正式公开站点应排除 API；继续在本机编辑后重新发布 |
| 图片保护 | 禁止普通右键与拖拽 | 仅降低普通复制便利度，无法阻止开发者工具、缓存和截图 |

2026-07-24 本地生产构建结果：成功。共生成 47 个页面，其中首页、简历、CMS 等为静态页面，40 个项目详情页为 SSG；仅 CMS 写入接口需要服务端。

## 素材体积

| 指标 | 数量/体积 |
|---|---:|
| `public` 总文件 | 479 个 / 775.78 MiB |
| 当前页面实际引用 | 197 个 / 460.69 MiB |
| 当前未引用 | 282 个 / 315.09 MiB |
| 缺失引用 | 0 |
| 重复文件组 | 86 组 |
| 理论可回收重复空间 | 223.31 MiB |

最大引用文件：

| 文件 | 体积 | 建议 |
|---|---:|---|
| `furniture-catalogue/image-01.jpg` | 74.42 MiB | 转 AVIF/WebP，目标 1-3 MiB |
| `g216-road-trip-film/video-01.mp4` | 47.87 MiB | 重新编码 MP4/H.264，建议 720p/1080p、按需加载 |
| `event-invitation-series/image-04.jpg` | 29.05 MiB | 转 AVIF/WebP，目标低于 3 MiB |
| `ai-computing-platform/image-01.jpg` | 20.95 MiB | 压缩并限制详情页显示宽度 |
| `3c-digital-commerce-platform/image-01.jpg` | 18.18 MiB | 压缩并生成首页缩略图 |
| `brand-corporate-website/image-01.jpg` | 18.13 MiB | 压缩并生成首页缩略图 |

建议发布包目标：图片总量压至 120-200 MiB，视频维持约 50 MiB 或改为对象存储；首页只加载 40 张独立的 1:1 缩略图，详情大图进入项目后再加载。删除确认未引用的 315.09 MiB 前应先备份。

完整哈希清单位于本目录：

- `used-assets-manifest.csv`：实际引用素材与 SHA-256。
- `unused-assets-manifest.csv`：未引用素材，暂不自动删除。
- `duplicate-assets.json`：重复文件组。
- `missing-assets.json`：缺失引用检查。
- `asset-rights-register.csv`：授权登记模板。
- `backup-used-assets.ps1`：按清单备份所有已用素材和项目数据。

## 版权风险

### 高风险：发布前必须确认

1. 40 个项目来自名为“练习文件【源文件找淮情免费领取】”的素材目录。这个来源名称不能证明商用或公开展示授权。若并非本人真实完成或没有原作者许可，不应作为本人商业作品发布；至少应标注“练习/概念项目”，并保留素材授权证据。
2. 项目中含 Umart、Samsung、MSI、HP、AMD、游戏 IP 等品牌、产品和商标。若属于真实受雇项目，应确认客户允许公开展示且不受 NDA 限制；若属于练习，应避免暗示官方合作。
3. `public/phantom` 中的字体和历史参考素材来源不明，并且网站视觉高度参考 Phantom。应移除未实际使用的 Phantom 文件，替换为可验证授权字体，避免 1:1 复制其独特品牌表达。
4. 简历人像剪影来源疑似花瓣参考图，原始作者和许可不明。建议替换为本人拥有版权的照片/剪影或重新生成并保留生成记录。
5. `geforce-bold.ttf`、`molot.otf`、下载的 SVG 图标和 AIGC 图标尚无随附许可证。GeForce 名称还涉及 NVIDIA 品牌。没有明确授权时，应换成 SIL Open Font License 字体和来源可追溯的图标。

### 中低风险：需要登记

1. 简历封面背景文件名显示可能来自 Unsplash；内容背景可能来自 Pexels。平台通常允许免费使用，但仍应保存原始作品页、作者、下载日期和许可证快照，不能只依赖文件名。
2. Adobe、Figma 等软件图标可用于说明技能，但应使用官方品牌资源、保持原样并避免暗示背书。
3. Next.js、React、Three.js 与 React Three Fiber 属常见开源依赖。发布时保留依赖锁文件及其许可证通知即可。

授权登记表中每个公开素材至少要补齐：来源网址、作者/客户、许可证、许可证明文件、是否允许作品集公开、状态和备注。

## 免费平台评估

| 平台 | 动效完整 | 本地 CMS 后重发 | 中国大陆稳定性 | 免费性 | 结论 |
|---|---|---|---|---|---|
| 腾讯 CloudBase 静态托管 | 是 | 是 | 国内厂商；正式大陆服务通常需备案 | 有免费体验额度，需手动续期，超额计费 | **首选近免费方案** |
| 腾讯 EdgeOne Pages | 是 | 是 | 未备案域名只能选择不含大陆的区域 | 当前免费公测/免费额度，政策可能变化 | 免费测试候选，不作大陆稳定承诺 |
| GitHub Pages | 是 | 是 | 无大陆 SLA，访问可能波动 | 免费 | 不符合稳定大陆要求 |
| Vercel / Netlify | 是 | 是 | 海外节点，无大陆 SLA | 有免费层 | 不符合稳定大陆要求 |
| Cloudflare Pages + R2 | 是 | 是 | Pages 不在中国网络；大陆网络需企业订阅与备案 | 海外免费层可用 | 不推荐本需求 |
| Gitee Pages | 理论可静态展示 | 是 | 国内访问条件较好 | 服务可用性和开放政策需以账号当前页面为准 | 不作为唯一正式方案 |

官方依据：腾讯 CloudBase [静态网站托管产品页](https://cloud.tencent.com/product/wh) 与 [计费说明](https://cloud.tencent.com/document/product/876/75213)；腾讯 EdgeOne [Pages](https://edgeone.cloud.tencent.com/pages/)、[免费额度说明](https://cloud.tencent.com/document/product/1552/132789) 与 [备案要求](https://cloud.tencent.com/document/faq/1552/110835)；Cloudflare [中国网络 FAQ](https://developers.cloudflare.com/china-network/faq/)、[接入要求](https://developers.cloudflare.com/china-network/get-started/)、[中国网络可用产品](https://developers.cloudflare.com/china-network/reference/available-products/) 和 [Workers 限制](https://developers.cloudflare.com/workers/platform/limits/)。免费政策和额度会变化，正式发布前需再次核对。

## 推荐发布流程

1. 完成授权清理：先解决练习素材、品牌项目、字体、人物剪影和图标来源。
2. 优化素材：生成首页 1:1 缩略图；将超大 JPG 转 AVIF/WebP；视频压缩并懒加载。
3. 清理发布包：只带 `used-assets-manifest.csv` 中的素材，删除发布副本中的 CMS 页面和写入 API，不动本地编辑项目。
4. 输出静态公开站：保留首页、简历和 40 个详情页的客户端动效。
5. 先用 CloudBase 免费体验环境验证；若访问量和免费额度满足，继续手动续期。
6. 若要正式稳定服务中国大陆，准备备案域名并迁移到大陆节点；此时接受少量必要成本。
7. 每次本地 CMS 更新后，重新构建并整体发布；不在公网开放 CMS 密码或写入接口。

## 发布门槛

当前技术门槛：通过。  
当前素材完整性：通过，无缺失引用。  
当前性能门槛：未通过，存在 74.42 MiB 图片和 47.87 MiB 视频。  
当前版权门槛：未通过，练习素材、字体、人物剪影和品牌项目缺少完整授权证明。  
当前“永久免费且大陆稳定”门槛：无平台可作严格承诺；CloudBase 免费体验是最接近的现实方案。
