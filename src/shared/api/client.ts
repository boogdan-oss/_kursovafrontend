import axios from 'axios'

// Відносний шлях: у dev проксіює Vite, у prod — Nginx
export const apiClient = axios.create({
  baseURL: '/api/v1',
  timeout: 10_000,
})
