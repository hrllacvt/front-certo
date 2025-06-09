// API Service Module
const API = {
    baseURL: 'http://localhost/backend/api', // Altere para sua URL do backend
    
    // Helper para fazer requisições
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Erro na requisição');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Métodos de autenticação
    auth: {
        async login(phone, password) {
            return API.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ phone, password })
            });
        },

        async register(userData) {
            return API.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
        },

        async forgotPassword(phone) {
            return API.request('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ phone })
            });
        },

        async adminLogin(username, password) {
            return API.request('/auth/admin-login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
        }
    },

    // Métodos de produtos
    products: {
        async getAll() {
            return API.request('/products');
        },

        async create(productData) {
            return API.request('/products/create', {
                method: 'POST',
                body: JSON.stringify(productData)
            });
        },

        async update(productData) {
            return API.request('/products/update', {
                method: 'POST',
                body: JSON.stringify(productData)
            });
        },

        async delete(id) {
            return API.request('/products/delete', {
                method: 'POST',
                body: JSON.stringify({ id })
            });
        }
    },

    // Métodos de pedidos
    orders: {
        async getAll(userId = null) {
            const endpoint = userId ? `/orders?user_id=${userId}` : '/orders';
            return API.request(endpoint);
        },

        async create(orderData) {
            return API.request('/orders/create', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });
        },

        async updateStatus(id, status, description = null, rejectionReason = null) {
            return API.request('/orders/update-status', {
                method: 'POST',
                body: JSON.stringify({ id, status, description, rejection_reason: rejectionReason })
            });
        }
    },

    // Métodos de administração
    admin: {
        async getAdmins() {
            return API.request('/admin/admins');
        },

        async createAdmin(adminData) {
            return API.request('/admin/admins', {
                method: 'POST',
                body: JSON.stringify(adminData)
            });
        },

        async deleteAdmin(id) {
            return API.request('/admin/admins', {
                method: 'DELETE',
                body: JSON.stringify({ id })
            });
        }
    },

    // Métodos de configuração
    config: {
        async getAll() {
            return API.request('/config');
        },

        async get(key) {
            return API.request(`/config?key=${key}`);
        },

        async set(key, value) {
            return API.request('/config', {
                method: 'POST',
                body: JSON.stringify({ key, value })
            });
        }
    }
};

// Tornar API globalmente disponível
window.API = API;