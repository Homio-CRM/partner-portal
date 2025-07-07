import axios from 'axios'

const DIRECTUS_BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_BASE_URL
const DIRECTUS_TOKEN = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN

// Criar instância do Axios para o Directus
export const directusApi = axios.create({
  baseURL: DIRECTUS_BASE_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
    'Content-Type': 'application/json',
  },
})

// Interceptor para tratar erros
directusApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na requisição ao Directus:', error)
    return Promise.reject(error)
  }
)

// Interceptor para logs de requisição (opcional, para debug)
directusApi.interceptors.request.use(
  (config) => {
    console.log(`Requisição para: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
) 