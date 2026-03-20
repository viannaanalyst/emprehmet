import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Separar pdfmake e docx em chunks próprios (carregados apenas na RevisaoLaudoPage)
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-pdf': ['pdfmake', 'html-to-pdfmake'],
          'vendor-docx': ['docx', 'file-saver'],
          'vendor-tiptap': [
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extension-underline',
            '@tiptap/extension-text-align',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 3500,
  },
})
