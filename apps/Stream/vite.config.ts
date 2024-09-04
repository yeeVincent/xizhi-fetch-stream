import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dts from 'vite-plugin-dts'
import { copyFileSync } from 'fs';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true, // 插入类型入口
      outDir: 'dist/types', // 类型定义文件输出目录
      tsconfigPath: './tsconfig.app.json', // 指定 tsconfig 文件路径
    }),
    {
      name: 'copy-package-json',
      closeBundle() {
        copyFileSync(resolve(__dirname, 'package.json'), resolve(__dirname, 'dist', 'package.json'));
        console.log('package.json has been copied to dist directory.');
      }
    }
  ],
  build: {
    lib: {
      entry: 'src/index.tsx', // 入口文件
      name: 'xizhi-fetch-stream', // 库的名称
      fileName: (format) => `xizhi-fetch-stream.${format}.js`, // 输出文件名
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['react', 'react-dom'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
})
