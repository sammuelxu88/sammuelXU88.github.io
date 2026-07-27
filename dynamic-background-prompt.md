# SENTINEL AI 动态背景与全屏 Hero 提示词

使用 React、Vite、TypeScript 和 Tailwind CSS 创建一个全屏深色 Hero 区域，并将 Spline 3D 场景作为可交互的动态背景。

## 页面与 Hero 结构

- 页面最外层使用 `<div className="bg-hero-bg min-h-screen">`。
- Hero 外层使用 `<section className="relative min-h-screen flex items-end bg-hero-bg overflow-hidden">`：
  - `min-h-screen`：至少占满整个视口高度。
  - `relative`：作为动态背景、遮罩和前景内容的定位容器。
  - `flex items-end`：将主要文案锚定在视口左下方。
  - `overflow-hidden`：隐藏 3D 场景超出 Hero 的部分。
  - `bg-hero-bg`：在 3D 场景加载前或加载失败时保持近黑色背景。
- 深色主题变量使用 `--hero-bg: 0 0% 8%`，并在 Tailwind 中映射为 `hero-bg: "hsl(var(--hero-bg))"`。

## Spline 3D 动态背景

- 安装并使用：
  - `@splinetool/react-spline`
  - `@splinetool/runtime`
- 使用 React 懒加载 Spline 组件，避免阻塞页面首屏：

```tsx
import { lazy, Suspense } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));
```

- 将 Spline 放入绝对定位、铺满 Hero 的背景容器：

```tsx
<div className="absolute inset-0">
  <Suspense fallback={<div className="absolute inset-0 bg-hero-bg" />}>
    <Spline
      scene="https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode"
      className="w-full h-full"
    />
  </Suspense>
</div>
```

- 必须使用以下精确场景地址：
  `https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode`
- Spline 背景需覆盖 Hero 的完整宽高，并保留鼠标或触控交互能力。

## 深色遮罩与图层关系

- 在 Spline 背景上方增加半透明黑色遮罩，以增强前景文字的可读性：

```tsx
<div className="absolute inset-0 bg-black/30 z-[1] pointer-events-none" />
```

- 图层从下到上依次为：
  1. Spline 3D 动态背景。
  2. `bg-black/30` 深色遮罩，使用 `z-[1]`。
  3. Hero 文案和按钮，使用 `relative z-10`。
  4. 固定悬浮导航栏，使用 `z-50`。
- 遮罩必须使用 `pointer-events-none`，不能阻止用户操作 Spline 场景。

## 左下角前景内容布局

- 内容容器使用：

```tsx
<div className="relative z-10 pointer-events-none w-full max-w-[90%] sm:max-w-md lg:max-w-2xl px-6 md:px-10 pb-10 md:pb-10 pt-32">
  {/* Hero content */}
</div>
```

- Hero 外层的 `flex items-end` 配合内容容器的底部内边距，使内容稳定停靠在视口左下方。
- 内容区使用 `pointer-events-none`，让文案覆盖区域中的鼠标事件继续传递给 Spline 动态背景。
- 所有需要点击的 CTA 按钮必须单独添加 `pointer-events-auto`，恢复按钮交互。
- 内容宽度保持响应式：移动端最大宽度为视口的 90%，较大屏幕逐步限制为 `sm:max-w-md` 和 `lg:max-w-2xl`。

## 前景入场动画

- Hero 文案与 CTA 使用交错的向上淡入动画，初始类名为 `opacity-0 animate-fade-up`。
- `fade-up` 动画定义：
  - 0%：`opacity: 0`、`transform: translateY(20px)`、`filter: blur(4px)`。
  - 100%：`opacity: 1`、`transform: translateY(0)`、`filter: blur(0)`。
  - 时长与缓动：`fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards`。
- 使用行内 `animationDelay` 形成层次：
  - 主标题：`0.2s`
  - 副标题：`0.4s`
  - 描述：`0.55s`
  - CTA 按钮组：`0.7s`
  - 信任信息：`0.85s`

## 导航栏与动态背景的关系

- 导航栏使用透明背景并固定悬浮于场景顶部：

```tsx
<nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-16 py-5">
  {/* Navigation */}
</nav>
```

- 不要为导航栏添加不透明底色，让 Spline 场景自然延伸至页面顶端。
- 移动端不显示导航链接和右侧 CTA，也不添加汉堡菜单。

## 核心交互要求

- 动态背景必须全屏、响应式并持续可见。
- 文案和遮罩不能拦截 Spline 的指针事件。
- CTA 按钮保持正常的点击、悬停和按压反馈。
- 页面不设置浅色模式，背景始终使用深色主题。
- Spline 加载过程中显示与 Hero 一致的近黑色占位背景，避免闪白。
