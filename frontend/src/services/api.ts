import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
    timeout: 10000,
});

// A MAGIA ACONTECE AQUI: O Interceptor
// Antes de qualquer requisição sair do React para o Express, esta função é executada.
api.interceptors.request.use((config) => {
    // 1. Procuramos na "carteira" do navegador (localStorage) se existe um token guardado
    const token = localStorage.getItem('token');
    
    // 2. Se existir, nós anexamos o token no cabeçalho (Header) exatamente como no Thunder Client
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
});

export default api;