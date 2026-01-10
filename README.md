# 超级计时器 2.0 ⏱️

一个功能强大、视觉震撼的多功能计时器 Web 应用。

![Aurora Purple Theme](https://img.shields.io/badge/theme-Aurora%20Purple-b084ff)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-success)

## ✨ 核心功能

### 🎯 三种计时模式

- **⏱️ 秒表** - 精确计时，支持计次功能
- **⏳ 目标倒计时** - 正向计时 + 自定义语音播报
- **🍅 番茄钟** - 25分钟专注 + 5分钟休息

### 🎨 视觉特效

- **💜 极光紫主题** - 紫粉蓝渐变配色
- **✨ 粒子星空背景** - 100+ 动态粒子流动
- **💎 玻璃态设计** - 毛玻璃半透明效果
- **🌓 主题切换** - 深色/浅色模式

### 🔊 智能语音

- **自定义播报时间点** - 想在什么时候提醒就在什么时候
- **本地语音引擎** - 使用系统自带语音，无需联网
- **自动保存设置** - 下次打开自动恢复

## 🚀 快速开始

### 在线访问
访问部署好的网站：[超级计时器](你的GitHub Pages链接)

### 本地运行
```bash
# 克隆仓库
git clone https://github.com/你的用户名/super-timer.git

# 进入目录
cd super-timer

# 直接打开 index.html 或使用本地服务器
```

### 添加到手机桌面（PWA）

1. 用手机浏览器打开网址
2. 点击浏览器菜单的"添加到主屏幕"
3. 桌面会出现应用图标，点击即可使用

## 📱 兼容性

- ✅ Chrome / Edge（推荐）
- ✅ Safari（iOS / macOS）
- ✅ Firefox
- ✅ 移动端浏览器

## 🛠️ 技术栈

- **前端框架**: 纯原生 JavaScript（无框架依赖）
- **样式**: CSS3 + Glassmorphism
- **动画**: Canvas API（粒子背景）
- **语音**: Web Speech API
- **字体**: Bebas Neue + Noto Sans SC

## 📁 项目结构

```
super-timer/
├── index.html      # 主页面
├── style.css       # 样式文件（极光紫主题 + 玻璃态）
├── script.js       # 核心逻辑（计时器 + 粒子动画）
└── README.md       # 说明文档
```

## 💡 使用提示

### 倒计时语音播报设置
1. 切换到"倒计时"标签
2. 输入想要播报的时间点（例如：1分0秒）
3. 点击"➕ 添加"
4. 可以添加多个时间点，也可以随时删除

### 主题切换
- 点击右上角的月亮/太阳图标即可切换深色/浅色模式
- 你的选择会自动保存

## 📄 许可证

MIT License - 自由使用和修改

## 🙏 致谢

由 [Antigravity](https://github.com/google-deepmind) 开发
