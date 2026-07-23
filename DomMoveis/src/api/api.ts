import axios from 'axios';

const api = axios.create({
    baseURL: 'https://dommoveis.store/api',
    headers: { 'Content-Type': 'application/json' },
});

// Função para determinar se a URL é pública (não precisa de token)
const isPublicRequest = (config: any): boolean => {
    const { url, method } = config;
    if (!url) return false;

    const normalizedUrl = url.replace(/^\/api/, '');
    const methodUpper = method?.toUpperCase();

    // Rotas de autenticação são sempre públicas
    if (normalizedUrl.startsWith('/auth/')) return true;

    // GET em produtos, categorias etc. são públicos (leitura)
    if (methodUpper === 'GET') {
        if (normalizedUrl === '/products') return true;
        if (/^\/products\/[^/]+$/.test(normalizedUrl)) return true;
        if (/^\/products\/slug\/[^/]+$/.test(normalizedUrl)) return true;
        if (/^\/products\/category\/[^/]+$/.test(normalizedUrl)) return true;
        if (normalizedUrl === '/categories') return true;
        if (/^\/categories\/[^/]+$/.test(normalizedUrl)) return true;
        if (/^\/categories\/slug\/[^/]+$/.test(normalizedUrl)) return true;
        if (/^\/images\/[^/]+$/.test(normalizedUrl)) return true;
        if (normalizedUrl.startsWith('/images/list/')) return true;
        if (normalizedUrl.startsWith('/images/tag/')) return true;
    }

    return false;
};

// Interceptor de requisição: adiciona token se NÃO for pública
api.interceptors.request.use(
    (config) => {
        console.log('📤 Requisição:', config.method?.toUpperCase(), config.url);
        if (!isPublicRequest(config)) {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log('✅ Token adicionado (primeiros 20):', token.substring(0, 20) + '...');
            } else {
                console.log('⚠️ Token não encontrado no localStorage');
            }
        } else {
            console.log('🌐 Rota pública, token NÃO adicionado');
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de resposta: trata 401 e faz refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        console.log('🔴 Erro na resposta:', error.response?.status, originalRequest.url);

        // Se for pública ou já tentamos renovar, rejeita
        if (isPublicRequest(originalRequest) || originalRequest._retry) {
            console.log('🚫 Rota pública ou já tentou refresh, rejeitando');
            return Promise.reject(error);
        }

        if (error.response?.status === 401) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('Sem refresh token');
                }

                console.log('🔄 Tentando refresh para:', originalRequest.url);
                const response = await api.post('/auth/refresh-token', { refreshToken });

                const data = response.data.data || {};
                const accessToken = data.accessToken || data.tokens?.accessToken;
                const newRefreshToken = data.refreshToken || data.tokens?.refreshToken;

                if (!accessToken) {
                    throw new Error('Access token não retornado');
                }

                try {
                    const decoded = JSON.parse(atob(accessToken.split('.')[1]));
                    console.log('🔓 Token decodificado:', decoded);
                } catch (e) {
                    console.log('⚠️ Não foi possível decodificar o token');
                }

                localStorage.setItem('accessToken', accessToken);
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken);
                    console.log('✅ Novo refreshToken salvo');
                } else {
                    console.log('ℹ️ Mantendo refreshToken atual');
                }

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                console.log('🔄 Header atualizado para repetição:', originalRequest.headers.Authorization);

                return axios(originalRequest);
            } catch (refreshError) {
                console.error('❌ Refresh falhou:', refreshError);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');

                // ✅ Cria um objeto de erro seguro para rejeitar
                const err = new Error('Sessão expirada. Faça login novamente.');
                // Copia propriedades úteis se existirem
                if (refreshError && typeof refreshError === 'object') {
                    Object.assign(err, refreshError);
                }
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default api;