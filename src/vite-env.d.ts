// src/vite-env.d.ts

/// <reference types="vite/client" />

// 图片模块声明
declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.ico' {
  const src: string;
  export default src;
}

// Markdown 文件声明
declare module '*.md?raw' {
  const content: string;
  export default content;
}