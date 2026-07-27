import { copyFile, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceRoot = String.raw`D:\Samuel-工作文件夹\练习文件【源文件找淮情免费领取】\作品集`;
const outputRoot = path.join(process.cwd(), "public", "portfolio", "organized");
const dataFile = path.join(process.cwd(), "content", "projects.json");
const supportedImages = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const supportedVideos = new Set([".mp4", ".mpeg4", ".webm", ".mov"]);

const projects = [
  { folder: "3C数码平台网页设计", slug: "3c-digital-commerce-platform", title: "3C 数码销售平台", client: "数码零售平台", category: "网页与体验设计", year: "2025", cover: "3C数码销售平台-cover.jpg", tags: ["电商平台", "UX/UI", "信息架构"], summary: "面向高密度数码商品信息，建立兼顾浏览效率、参数比较与购买决策的电商平台体验。", description: "项目围绕数码消费者从发现、筛选、比较到下单的完整路径展开，重构首页、分类导航、商品列表与详情信息层级。视觉上以清晰的模块节奏承载复杂参数，并通过统一组件和促销规则保持多页面的一致性。", role: "体验策略、信息架构、界面视觉、组件规范" },
  { folder: "AI算力网页设计", slug: "ai-computing-platform", title: "AI 算力服务平台", client: "AI 科技品牌", category: "网页与体验设计", year: "2025", cover: "AI算力网页-cover.jpg", tags: ["AI 科技", "官网设计", "产品叙事"], summary: "将抽象的算力服务转译为清晰、可信且具有未来感的数字产品叙事。", description: "通过服务能力、应用场景、技术优势与合作流程四层内容结构，帮助用户快速理解复杂的 AI 算力产品。页面采用克制的科技视觉与明确的行动路径，在品牌表达和商业转化之间取得平衡。", role: "内容架构、视觉方向、网页设计、交互规范" },
  { folder: "品牌官网页面设计", slug: "brand-corporate-website", title: "品牌官方网站设计", client: "企业品牌", category: "网页与体验设计", year: "2025", cover: "品牌官网页面设计-cover.jpg", tags: ["品牌官网", "网页视觉", "响应式系统"], summary: "以品牌价值和业务内容为核心，构建具有识别度的企业官网视觉系统。", description: "项目从品牌定位出发梳理首页叙事、服务模块与内容节奏，利用大幅视觉、清晰栅格和稳定的组件语言建立专业感。设计同时考虑不同内容长度和后续运营扩展，形成可持续维护的页面体系。", role: "创意方向、页面结构、视觉设计、组件延展" },
  { folder: "万城万充电动汽车充电平台", slug: "wancheng-ev-charging-app", title: "万城万充电动汽车充电平台", client: "万城万充", category: "产品与界面设计", year: "2024", cover: "电动汽车充电APP作品集-cover.jpg", tags: ["移动应用", "充电服务", "产品体验"], summary: "围绕找桩、导航、充电和支付，设计完整的新能源汽车补能服务体验。", description: "项目聚焦驾驶者在陌生环境中的高频任务，将站点状态、距离、价格和可用枪口等关键信息前置。通过地图与列表协同、清晰的充电流程反馈和统一状态语言，降低使用焦虑并提升任务完成效率。", role: "产品梳理、用户流程、UI 设计、交互原型" },
  { folder: "房产中介APP", slug: "real-estate-agent-app", title: "房产中介移动应用", client: "珍房网", category: "产品与界面设计", year: "2024", cover: "珍房网ui-cover.jpg", tags: ["房产平台", "移动应用", "信息设计"], summary: "为房源发现、咨询与跟进场景建立可信、易扫读的移动端体验。", description: "设计围绕房源筛选、详情阅读、顾问联系和收藏管理展开，将面积、价格、区位与配套等决策信息按优先级组织。界面在专业可信与生活感之间保持平衡，让用户能够快速比较并继续后续咨询。", role: "需求梳理、信息架构、UI 设计、交互流程" },
  { folder: "旅行APP", slug: "travel-planning-app", title: "旅行规划应用", client: "概念项目", category: "产品与界面设计", year: "2024", cover: "旅行APP-设计思路-cover.jpg", tags: ["旅行体验", "移动应用", "行程规划"], summary: "把目的地发现、行程组织与旅行灵感整合为轻量、连续的移动体验。", description: "项目从旅行前的灵感收集切入，建立目的地浏览、内容收藏、日程编排和信息提醒的核心流程。视觉强调沉浸图片与简洁操作，让复杂行程信息在移动端保持清楚、轻松和可执行。", role: "产品概念、用户流程、UI 视觉、原型设计" },
  { folder: "万城万充电动汽车充电终端-UI页面", slug: "ev-charging-terminal-ui", title: "电动汽车充电终端界面", client: "万城万充", category: "产品与界面设计", year: "2024", cover: "电动汽车充电终端UI页面-cover.jpg", tags: ["终端界面", "充电设备", "状态反馈"], summary: "面向公共充电终端，建立在不同光线和操作距离下都清晰可靠的交互界面。", description: "终端流程覆盖身份确认、枪口选择、充电启动、实时状态、费用结算和异常提醒。设计强化数字、状态和主要操作的层级，并以高对比反馈减少误操作，适配公共设备的快速使用场景。", role: "流程设计、终端 UI、状态体系、视觉规范" },
  { folder: "充电枪详情页", slug: "ev-charger-product-detail", title: "充电枪电商详情页", client: "新能源设备品牌", category: "电商与内容设计", year: "2024", cover: "充电枪详情页-cover.jpg", tags: ["电商详情", "产品卖点", "长页设计"], summary: "通过结构化卖点与场景化视觉，建立充电设备的专业产品详情体验。", description: "长页围绕安全性、兼容性、材料工艺和使用方式组织信息，使用产品特写、功能拆解与参数模块逐步建立信任。设计兼顾销售说服力与技术信息准确性，使消费者能够快速理解产品价值。", role: "卖点梳理、详情页策划、视觉设计、版式延展" },
  { folder: "电商详情页", slug: "travel-commerce-detail", title: "旅行服务电商详情页", client: "旅行服务品牌", category: "电商与内容设计", year: "2024", cover: "旅行详情页-cover.jpg", tags: ["旅行产品", "电商长页", "内容营销"], summary: "将旅行产品的路线、体验与服务信息组织成具有吸引力的长页叙事。", description: "项目以用户决策顺序为依据，依次呈现目的地氛围、核心体验、行程安排、服务保障和预订信息。通过图文节奏和明确的信息分区，将感性种草与理性决策自然衔接。", role: "内容策划、信息层级、详情页视觉、版式设计" },
  { folder: "科技公司VI", slug: "guoyu-technology-visual-identity", title: "国钰科技品牌视觉识别", client: "国钰科技", category: "品牌与视觉识别", year: "2024", cover: "国钰科技VI-cover.jpg", tags: ["品牌识别", "科技企业", "VI 系统"], summary: "为科技企业建立理性、现代且具有扩展性的品牌视觉识别系统。", description: "从标志结构、标准色和辅助图形出发，延展至办公、传播与数字触点。系统通过统一比例、色彩和图形逻辑强化品牌记忆，同时保留足够弹性以适应不同业务与媒介。", role: "品牌策略、标志设计、VI 规范、应用延展" },
  { folder: "餐厅LOGO-VI", slug: "restaurant-brand-identity", title: "餐厅品牌 LOGO 与 VI", client: "餐饮品牌", category: "品牌与视觉识别", year: "2024", cover: "餐厅LOGO&VI延伸设计-cover.jpg", tags: ["餐饮品牌", "标志设计", "空间延展"], summary: "以餐饮体验为线索，建立兼具识别度与应用灵活性的品牌视觉语言。", description: "项目从品牌气质与消费场景提炼标志概念，并将字体、色彩、图形和版式延展到菜单、包装、物料与空间触点。整体系统强调一致识别，同时保留适合餐饮传播的亲和力。", role: "品牌概念、标志设计、视觉系统、应用设计" },
  { folder: "C4D产品海报", slug: "c4d-product-poster-series", title: "C4D 产品视觉海报", client: "概念项目", category: "三维与动态视觉", year: "2024", cover: "产品三维效果图-cover.jpg", tags: ["C4D", "产品视觉", "广告海报"], summary: "运用三维材质、灯光与构图，为产品建立具有广告表现力的视觉场景。", description: "系列海报探索产品主体与抽象空间、材质反射和色彩氛围的关系。通过建模、灯光、渲染与后期合成强化产品轮廓和质感，并为不同传播主题建立统一的视觉张力。", role: "三维建模、材质灯光、渲染、后期合成" },
  { folder: "C4D三维效果图", slug: "ev-charging-station-3d", title: "充电站三维空间效果图", client: "新能源基础设施品牌", category: "三维与动态视觉", year: "2024", cover: "三维效果图-cover.jpg", tags: ["空间设计", "C4D", "场景渲染"], summary: "以真实使用环境为基础，呈现新能源充电站的空间、设备和品牌体验。", description: "项目对站点结构、车位、充电设备和导视关系进行三维搭建，重点处理尺度、材质、昼夜灯光与车辆动线。效果图用于验证空间方案并向客户清晰传达最终体验。", role: "场景建模、空间构图、材质灯光、效果表现" },
  { folder: "价签系统", slug: "retail-price-label-system", title: "零售价签视觉系统", client: "零售品牌", category: "品牌与信息设计", year: "2024", cover: "价签系统-cover.jpg", tags: ["零售系统", "信息设计", "规范手册"], summary: "重构零售价签的信息优先级与使用规范，让价格、促销和产品信息更高效传达。", description: "系统覆盖常规价、促销价、会员价与不同商品类别，通过网格、字号、颜色和标签规则建立清晰层级。配套说明文档统一制作与落地标准，提升门店执行效率和品牌一致性。", role: "信息架构、视觉规范、模板设计、使用手册" },
  { folder: "产品手册", slug: "product-catalogue-2025", title: "2025 产品手册", client: "工业设备品牌", category: "品牌与信息设计", year: "2025", cover: "25年产品画册sample-cover.jpg", tags: ["产品画册", "信息排版", "编辑设计"], summary: "将复杂产品线、技术参数与品牌信息整理为易查阅的系统化产品手册。", description: "项目建立封面、章节、产品页和参数表的统一编辑规则，通过稳定栅格与清晰层级提升大量信息的阅读效率。版式兼顾品牌形象、产品展示和销售人员的实际查阅需求。", role: "内容整理、编辑设计、版式系统、印刷文件" },
  { folder: "英文产品画册", slug: "english-product-catalogue", title: "英文产品画册", client: "国际业务部门", category: "品牌与信息设计", year: "2025", cover: "英文产品画册 -cover.jpg", tags: ["英文画册", "国际传播", "编辑设计"], summary: "面向海外市场，以清晰的英文信息和产品图像构建专业的品牌销售工具。", description: "画册针对英文阅读节奏重新组织标题、卖点、参数与场景内容，统一跨页结构和图文比例。设计强调国际化、专业性和产品可信度，适合展会、客户沟通与数字分发。", role: "英文版式、信息设计、产品编排、输出规范" },
  { folder: "家具画册", slug: "furniture-catalogue", title: "家具品牌画册", client: "家具品牌", category: "品牌与信息设计", year: "2024", cover: "家具画册-cover.jpg", tags: ["家具画册", "生活方式", "编辑设计"], summary: "以空间氛围和产品细节共同塑造家具品牌的生活方式表达。", description: "画册通过场景大图、产品组合、细节特写与规格信息形成疏密有致的阅读节奏。版式保持克制，让材质、比例和空间气质成为视觉核心，同时满足产品检索与销售展示。", role: "艺术指导、画册版式、图片编排、印刷设计" },
  { folder: "展会品宣物料", slug: "shanghai-exhibition-campaign", title: "上海展会品宣物料", client: "工业设备品牌", category: "活动与传播设计", year: "2025", cover: "展会物料-cover.jpg", tags: ["展会传播", "倒计时海报", "产品海报"], summary: "围绕展会前预热与现场传播，建立连续统一的产品宣传视觉。", description: "系列物料覆盖展会倒计时、产品亮点和到场引导，以统一构图、品牌色和信息节奏形成连续曝光。设计同时考虑社交平台快速阅读和线下展示的清晰度。", role: "活动主视觉、海报系列、传播节奏、多尺寸输出" },
  { folder: "文化墙", slug: "corporate-culture-wall", title: "企业文化墙设计", client: "企业品牌", category: "空间与品牌设计", year: "2024", cover: "文化墙-cover.jpg", tags: ["文化空间", "品牌展示", "环境图形"], summary: "将企业价值、发展信息与品牌视觉转化为可感知的空间传播界面。", description: "项目根据墙面尺度和观看动线规划内容层级，将品牌主张、团队文化与发展节点融入统一图形系统。设计兼顾远距离识别和近距离阅读，并考虑实际材质与施工落地。", role: "内容规划、环境图形、版式设计、落地规范" },
  { folder: "邀请函", slug: "event-invitation-series", title: "品牌活动邀请函", client: "企业品牌", category: "活动与传播设计", year: "2024", cover: "邀请函-cover.jpg", tags: ["邀请函", "活动视觉", "印刷设计"], summary: "以仪式感和品牌识别为核心，设计适用于不同活动场景的邀请函系列。", description: "系列作品通过字体、图形、纸张质感和信息层级建立明确主题，让时间、地点与参与方式清晰可读。视觉语言在正式感与传播吸引力之间保持平衡。", role: "视觉概念、版式设计、印刷工艺、系列延展" },
  { folder: "品宣海報", slug: "new-year-brand-poster-series", title: "元旦品牌海报系列", client: "企业品牌", category: "活动与传播设计", year: "2024", cover: "元旦海报-cover.jpg", tags: ["节日海报", "品牌传播", "系列视觉"], summary: "以新年主题为线索，探索品牌图形、节日情绪与系列传播的统一表达。", description: "九张海报从不同构图和视觉隐喻展开，在统一色彩与版式框架下形成连续内容。作品兼顾节日氛围、品牌露出和社交媒体传播效率。", role: "创意概念、海报设计、系列系统、传播适配" },
  { folder: "活动海报", slug: "event-poster-collection", title: "活动视觉海报合集", client: "多个品牌", category: "活动与传播设计", year: "2024", cover: "活动海报-cover.jpg", tags: ["海报设计", "视觉实验", "活动传播"], summary: "以不同主题和受众为背景，展示从概念提炼到视觉落地的海报设计能力。", description: "作品涵盖文化、商业与品牌活动，通过字体、图像、色彩和构图建立各自鲜明的传播重点。合集体现对不同风格语言的控制，以及在有限版面内组织信息的能力。", role: "创意构思、视觉设计、字体编排、输出制作" },
  { folder: "充电卡", slug: "gac-ev-charging-card", title: "广汽传祺充电卡", client: "广汽传祺", category: "品牌与视觉识别", year: "2024", cover: "广汽传祺充电卡B-04.jpg", tags: ["卡片设计", "汽车品牌", "品牌延展"], summary: "将汽车品牌识别与新能源服务场景结合，形成简洁、可靠的实体卡片设计。", description: "充电卡围绕品牌标志、服务属性和持卡信息进行正反面编排，通过色彩、图形和留白强化科技感与品质感。设计同时考虑实际卡片尺寸、印刷工艺和日常识别效率。", role: "视觉概念、卡面设计、信息编排、印刷输出" },
  { folder: "国道216穿越行程短视频", slug: "g216-road-trip-film", title: "国道 216 穿越行程短视频", client: "个人影像项目", category: "影像与动态内容", year: "2024", cover: "国道216穿越行程短视频-cover.jpg", tags: ["旅行影像", "短视频", "剪辑叙事"], summary: "以公路穿越为线索，通过节奏、景别与声音组织沉浸式旅行影像。", description: "短片记录国道 216 沿途地貌、行驶过程与人物体验，通过素材筛选、节奏控制和转场建立连续叙事。画面强调环境尺度与在路上的真实感，呈现个人对旅行影像语言的探索。", role: "拍摄策划、素材剪辑、节奏设计、后期调色" },
  { folder: "重庆旅行Vlog短视频", slug: "chongqing-travel-vlog", title: "重庆旅行 Vlog", client: "个人影像项目", category: "影像与动态内容", year: "2024", cover: "重庆旅行Vlog短视频-cover.jpg", tags: ["城市影像", "Vlog", "动态剪辑"], summary: "通过城市空间、街头细节与移动镜头，记录重庆独特的立体城市体验。", description: "视频以旅行者视角串联交通、建筑、夜景和日常片段，利用快慢节奏变化强化城市层次。剪辑兼顾信息记录和情绪表达，形成轻量但完整的城市旅行叙事。", role: "拍摄、剪辑、字幕设计、后期处理" },
  { folder: "ASUS 营销活动", slug: "asus-gaming-campaign", title: "ASUS 电竞产品营销视觉", client: "ASUS", category: "电商营销视觉", year: "2026", cover: "A3-TUF Gaming VG27WQ3B banner-1080x1080b.jpg", tags: ["电竞产品", "活动视觉", "社交传播"], summary: "以硬核性能和电竞氛围为核心，为 ASUS 产品建立高冲击力营销画面。", description: "系列视觉围绕显示器和联名硬件的核心卖点展开，通过产品英雄图、强对比标题和性能信息建立快速识别。统一的构图规则让不同产品在社交、电商与活动渠道保持一致表现。", role: "活动主视觉、产品合成、卖点编排、尺寸延展" },
  { folder: "Samsung monitor 营销活动", slug: "samsung-odyssey-monitor-campaign", title: "Samsung Odyssey 显示器营销", client: "Samsung", category: "电商营销视觉", year: "2026", cover: "A1-Odyssey OLED G8 G85SD-banner-1080x1080.jpg", tags: ["显示器营销", "产品视觉", "多版本创意"], summary: "围绕 OLED 画质与沉浸体验，建立 Samsung Odyssey 显示器系列营销视觉。", description: "六组画面从产品外观、游戏氛围、性能卖点和促销利益点切入，探索同一产品的多种传播方向。视觉保持品牌科技感，同时确保关键信息在快速浏览中清晰可见。", role: "创意方向、产品合成、营销版式、系列延展" },
  { folder: "Gigabyte 营销活动", slug: "gigabyte-bundle-campaign", title: "Gigabyte 笔记本套装营销", client: "Gigabyte", category: "电商营销视觉", year: "2026", cover: "Gigabyte Laptops and Monitors Bundles banner 1080x1080-60122.jpg", tags: ["产品套装", "零售营销", "多尺寸广告"], summary: "清晰传达笔记本与显示器套装利益点，构建适配多广告位的零售活动视觉。", description: "项目以套装关系和赠品价值为视觉核心，通过产品层次、价格信息和行动提示缩短用户理解路径。方形、横幅和窄幅版本共享统一构图逻辑，保证跨渠道识别。", role: "活动视觉、产品合成、信息层级、多尺寸适配" },
  { folder: "MSI 营销活动", slug: "msi-gpu-giveaway", title: "MSI 显卡赠奖活动", client: "MSI", category: "电商营销视觉", year: "2026", cover: "MSI GPU giveaway-banner-1080X1080.jpg", tags: ["赠奖活动", "显卡产品", "营销传播"], summary: "以赠奖机制和显卡性能为核心，打造具有游戏氛围的活动传播画面。", description: "视觉将奖品、参与机制和品牌资产组织在清晰的阅读顺序中，并以游戏场景与高对比色彩强化吸引力。多尺寸版本适配社交媒体、官网横幅和广告投放。", role: "活动主视觉、信息设计、产品合成、多尺寸延展" },
  { folder: "PAX 营销活动", slug: "pax-gaming-sale", title: "PAX 游戏周营销活动", client: "Umart", category: "电商营销视觉", year: "2025", cover: "PAX-BANNER-1080x1080-cover.png", tags: ["游戏营销", "促销活动", "落地页"], summary: "以游戏周氛围和硬件优惠为主线，构建从广告到落地页的完整活动体验。", description: "项目统一主视觉、横幅与落地页的色彩和图形语言，突出活动主题、核心产品和优惠信息。页面通过清晰分区承载多品类内容，并保持促销节奏与浏览效率。", role: "活动概念、主视觉、落地页设计、广告延展" },
  { folder: "Boxing Day营销活动", slug: "boxing-day-campaign", title: "Boxing Day 年末营销活动", client: "Umart", category: "电商营销视觉", year: "2025", cover: "Boxing Day202512.2-1080x1080d-cover.jpg", tags: ["年末促销", "电商活动", "落地页"], summary: "以礼盒和数码产品构成鲜明节日记忆，统一 Boxing Day 多渠道促销体验。", description: "系列包含方形主视觉、横幅、侧栏广告与活动落地页。设计用高识别红色、礼盒元素和产品组合强化节庆感，并通过稳定的信息层级承载不同优惠内容。", role: "活动主视觉、产品合成、落地页、多尺寸延展" },
  { folder: "Christmas sale 营销活动", slug: "christmas-sale-campaign", title: "Christmas Sale 圣诞营销活动", client: "Umart", category: "电商营销视觉", year: "2025", cover: "Christmas sale banner-1080x1080-cover.jpg", tags: ["圣诞促销", "电商活动", "视觉系统"], summary: "以霓虹圣诞树和数码产品组合，建立年轻、醒目的节日促销视觉。", description: "活动系统覆盖社交方图、网页横幅、侧栏和长页面，通过统一主题图形串联不同广告位。视觉在节日氛围与产品信息之间保持清晰层级，提升全渠道一致性。", role: "主题创意、活动视觉、页面设计、尺寸延展" },
  { folder: "Easter Sale营销活动", slug: "easter-sale-campaign", title: "Easter Sale 复活节营销活动", client: "Umart", category: "电商营销视觉", year: "2026", cover: "Easter Sale banner-1080x1080-cover.jpg", tags: ["复活节促销", "电商活动", "落地页"], summary: "运用明快插画和节日符号，为复活节促销建立轻松活跃的活动系统。", description: "从方形主视觉到横幅、侧栏和活动页，设计保持统一的色彩、图形和产品表达。信息层级优先突出活动利益点，同时用轻量插画增强节日辨识度和亲和力。", role: "活动主视觉、插画整合、页面设计、多尺寸输出" },
  { folder: "Mum’s Day 营销活动", slug: "mothers-day-campaign", title: "Mum’s Day 母亲节营销活动", client: "Umart", category: "电商营销视觉", year: "2026", cover: "Make Mum’s Day banner 1080x1080 -cover.jpg", tags: ["母亲节", "礼赠营销", "电商页面"], summary: "以柔和礼赠场景连接科技产品与母亲节情感，形成完整活动叙事。", description: "视觉通过柔和色彩、礼物组合和生活化文案降低数码产品的距离感，并将方形广告、横幅和落地页组织为统一体验。内容从情感引导自然过渡到品类与购买行动。", role: "主题策划、活动视觉、落地页、广告延展" },
  { folder: "EOFY sale 营销活动", slug: "eofy-sale-system", title: "EOFY 财年末营销视觉系统", client: "Umart / MSY / Thermaltake", category: "电商营销视觉", year: "2026", cover: "EOFY sale banner 1080X1080 260506.jpg", tags: ["财年末促销", "优惠券", "零售视觉"], summary: "围绕财年末高密度促销场景，为多个品牌和优惠机制建立清晰强势的视觉表达。", description: "项目涵盖主活动、优惠券和合作品牌版本，以高对比标题、产品组合和代码信息构成快速决策界面。不同画面共享促销语言，同时保留各品牌的识别资产。", role: "促销系统、版式设计、品牌适配、广告输出" },
  { folder: "umart 营销活动", slug: "umart-retail-campaign-collection", title: "Umart 零售营销视觉合集", client: "Umart", category: "电商营销视觉", year: "2026", cover: "MSY-Custom PC Builder banner 1080x1080-cover.jpg", tags: ["零售传播", "多主题活动", "产品营销"], summary: "覆盖游戏联名、配送服务与节日促销，展示多主题零售活动的视觉适配能力。", description: "合集包含多个独立营销主题，每张画面均围绕目标受众、核心利益点和品牌合作关系建立明确重点。设计在快速生产要求下保持产品表现、信息层级和品牌识别的一致标准。", role: "活动视觉、产品合成、品牌协同、快速延展" },
  { folder: "uamrt 通告画面", slug: "umart-holiday-notice-system", title: "Umart 假日通告视觉系统", client: "Umart", category: "品牌信息视觉", year: "2026", cover: "A3-the AFL Grand Final holiday banner 1080X1080 260622.jpg", tags: ["品牌通告", "节日信息", "模板系统"], summary: "将门店营业信息与节日主题结合，建立易识别、可持续复用的通告视觉。", description: "四组通告分别对应不同公共假日，通过统一品牌框架、日期层级和主题插画保证快速阅读。模板系统兼顾品牌一致性和运营团队的高频更新需求。", role: "信息设计、模板系统、节日视觉、社交适配" },
  { folder: "EDM-电子邮件营销", slug: "edm-campaign-one", title: "EDM 电商邮件营销 01", client: "零售品牌", category: "电商与内容设计", year: "2025", cover: "A1-EDM-cover.jpg", tags: ["EDM", "邮件营销", "内容编排"], summary: "以明确主题和商品节奏组织长邮件内容，提升移动端快速阅读与点击效率。", description: "邮件从首屏主视觉、核心优惠到产品分组逐步展开，通过模块化结构控制信息密度。设计兼顾品牌氛围、商品露出和按钮行动，让复杂营销内容保持清晰连续。", role: "邮件结构、视觉设计、商品编排、移动适配" },
  { folder: "EDM-电子邮件营销 - A2", slug: "edm-campaign-two", title: "EDM 电商邮件营销 02", client: "零售品牌", category: "电商与内容设计", year: "2025", cover: "A2-EDM-cover.jpg", tags: ["EDM", "促销邮件", "模块设计"], summary: "通过主题化首屏与模块化商品内容，构建兼具氛围和转化效率的营销邮件。", description: "本组方案强化首屏视觉记忆，并以稳定网格承载不同品类和优惠信息。标题、价格与行动按钮保持一致规则，使长邮件在桌面与移动阅读中都具备明确节奏。", role: "主题视觉、邮件版式、模块规范、内容延展" },
  { folder: "EDM-电子邮件营销 - A3", slug: "edm-campaign-three", title: "EDM 电商邮件营销 03", client: "零售品牌", category: "电商与内容设计", year: "2025", cover: "A3-EDM-cover.jpg", tags: ["EDM", "品牌邮件", "视觉转化"], summary: "以更精简的内容路径突出单一营销主题，形成快速、直接的邮件阅读体验。", description: "方案减少非核心信息，用更鲜明的首屏和紧凑产品模块推动用户完成从兴趣到点击的转化。视觉规范确保图片、文字与按钮在不同邮件客户端中保持稳定表现。", role: "内容精简、邮件视觉、转化路径、适配规范" }
];

function mediaType(extension) {
  if (supportedVideos.has(extension)) return "video";
  if (extension === ".gif") return "gif";
  return "image";
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

const outputProjects = [];
for (const project of projects) {
  const sourceFolder = path.join(sourceRoot, project.folder);
  const files = (await readdir(sourceFolder, { withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => {
      const extension = path.extname(name).toLowerCase();
      return supportedImages.has(extension) || supportedVideos.has(extension);
    })
    .sort((a, b) => a.localeCompare(b, "zh-CN", { numeric: true }));

  if (!files.includes(project.cover)) {
    throw new Error(`Missing cover for ${project.folder}: ${project.cover}`);
  }

  const destinationFolder = path.join(outputRoot, project.slug);
  await mkdir(destinationFolder, { recursive: true });
  const orderedFiles = [project.cover, ...files.filter((name) => name !== project.cover)];
  const images = [];
  let imageIndex = 0;
  let videoIndex = 0;

  for (const name of orderedFiles) {
    const extension = path.extname(name).toLowerCase();
    const isCover = name === project.cover;
    const isVideo = supportedVideos.has(extension);
    const destinationName = isCover
      ? `cover${extension}`
      : isVideo
        ? `video-${String(++videoIndex).padStart(2, "0")}${extension}`
        : `image-${String(++imageIndex).padStart(2, "0")}${extension}`;
    await copyFile(path.join(sourceFolder, name), path.join(destinationFolder, destinationName));
    const src = `/portfolio/organized/${project.slug}/${destinationName}`;
    images.push(isVideo ? { src, type: mediaType(extension) } : src);
  }

  const cover = images[0];
  outputProjects.push({
    slug: project.slug,
    title: project.title,
    titleCn: project.title,
    year: project.year,
    client: project.client,
    category: project.category,
    zone: project.category,
    region: "视觉设计",
    tags: project.tags,
    services: project.tags,
    cover,
    alt: `${project.title} 首页封面`,
    images,
    summary: project.summary,
    summaryCn: project.summary,
    description: project.description,
    descriptionCn: project.description,
    role: project.role,
    hideCoverInDetail: false
  });
}

await writeFile(dataFile, `${JSON.stringify(outputProjects, null, 2)}\n`, "utf8");
console.log(`Imported ${outputProjects.length} projects into ${outputRoot}`);
