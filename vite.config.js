import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  // cho phép sử dụng process.env, mặc định thì ko mà sẽ phải dùng import.meta.env
  define:{
    'process.env':process.env
  },
  plugins: [
    react(),
    svgr()
  ],
  resolve:{
    alias:[
      { find: '~', replacement: '/src' }
    ]
  },
  //base:'/web-trello'
})
