// Authentication Module
const Auth = {
    // Initialize default users
    init: () => {
        const users = Utils.storage.get('users') || [];
        if (users.length === 0) {
            // Create default admin user
            const defaultUsers = [
                {
                    id: Utils.generateId(),
                    name: 'Administrador',
                    phone: '(00) 00000-0000',
                    email: 'admin@salgadosdasara.com',
                    address: 'Rua Ida Berlet, 1738 B',
                    number: '1738',
                    complement: 'B',
                    city: 'Quinze de Novembro',
                    password: '123456',
                    isAdmin: true,
                    createdAt: new Date().toISOString()
                }
            ];
            Utils.storage.set('users', defaultUsers);
        }

        // Initialize admin users
        const adminUsers = Utils.storage.get('adminUsers') || [];
        if (adminUsers.length === 0) {
            const defaultAdmins = [
                {
                    id: Utils.generateId(),
                    username: 'sara',
                    password: '123',
                    role: 'admin',
                    createdAt: new Date().toISOString()
                }
            ];
            Utils.storage.set('adminUsers', defaultAdmins);
        }
    },

    // Login user
    login: (phone, password) => {
        const users = Utils.storage.get('users') || [];
        const user = users.find(u => u.phone === phone && u.password === password);
        
        if (user) {
            Utils.storage.set('currentUser', user);
            return { success: true, user };
        }
        
        return { success: false, message: 'Telefone ou senha incorretos' };
    },

    // Register user
    register: (userData) => {
        const users = Utils.storage.get('users') || [];
        
        // Check if user already exists
        const existingUser = users.find(u => u.phone === userData.phone || u.email === userData.email);
        if (existingUser) {
            return { success: false, message: 'Usuário já cadastrado com este telefone ou email' };
        }

        // Validate data
        const validationRules = {
            name: { required: true, label: 'Nome completo' },
            phone: { required: true, phone: true, label: 'Telefone' },
            email: { required: true, email: true, label: 'Email' },
            address: { required: true, label: 'Endereço' },
            number: { required: true, label: 'Número' },
            city: { required: true, label: 'Cidade' },
            password: { required: true, minLength: 6, label: 'Senha' },
            confirmPassword: { required: true, match: 'password', label: 'Confirmar senha' }
        };

        const errors = Utils.validateForm(userData, validationRules);
        if (Object.keys(errors).length > 0) {
            return { success: false, errors };
        }

        // Create new user
        const newUser = {
            id: Utils.generateId(),
            name: userData.name,
            phone: Utils.formatPhone(userData.phone),
            email: userData.email,
            address: userData.address,
            number: userData.number,
            complement: userData.complement || '',
            city: userData.city,
            password: userData.password,
            isAdmin: false,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        Utils.storage.set('users', users);
        Utils.storage.set('currentUser', newUser);

        return { success: true, user: newUser };
    },

    // Forgot password
    forgotPassword: (phone) => {
        const users = Utils.storage.get('users') || [];
        const user = users.find(u => u.phone === phone);
        
        if (user) {
            // In a real app, this would send an email/SMS
            // For demo purposes, we'll just show the password
            return { 
                success: true, 
                message: `Sua senha é: ${user.password}` 
            };
        }
        
        return { success: false, message: 'Usuário não encontrado' };
    },

    // Admin login
    adminLogin: (username, password) => {
        const adminUsers = Utils.storage.get('adminUsers') || [];
        const admin = adminUsers.find(a => a.username === username && a.password === password);
        
        if (admin) {
            Utils.storage.set('currentAdmin', admin);
            return { success: true, admin };
        }
        
        return { success: false, message: 'Usuário ou senha incorretos' };
    },

    // Logout
    logout: () => {
        Utils.storage.remove('currentUser');
        Utils.storage.remove('currentAdmin');
    },

    // Check if user is logged in
    isLoggedIn: () => {
        return Utils.storage.get('currentUser') !== null;
    },

    // Check if admin is logged in
    isAdminLoggedIn: () => {
        return Utils.storage.get('currentAdmin') !== null;
    },

    // Get current user
    getCurrentUser: () => {
        return Utils.storage.get('currentUser');
    },

    // Get current admin
    getCurrentAdmin: () => {
        return Utils.storage.get('currentAdmin');
    }
};

// Form handlers
document.addEventListener('DOMContentLoaded', () => {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(loginForm);
            const phone = formData.get('phone');
            const password = formData.get('password');

            const result = Auth.login(phone, password);
            
            if (result.success) {
                Utils.showMessage('Login realizado com sucesso!');
                setTimeout(() => {
                    App.showMainApp();
                }, 1000);
            } else {
                Utils.showMessage(result.message, 'error');
            }
        });
    }

    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(registerForm);
            const userData = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                address: formData.get('address'),
                number: formData.get('number'),
                complement: formData.get('complement'),
                city: formData.get('city'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword')
            };

            const result = Auth.register(userData);
            
            if (result.success) {
                Utils.showMessage('Conta criada com sucesso!');
                setTimeout(() => {
                    App.showMainApp();
                }, 1000);
            } else {
                if (result.errors) {
                    // Show field-specific errors
                    for (const field in result.errors) {
                        const fieldEl = document.querySelector(`[name="${field}"]`);
                        if (fieldEl) {
                            const formGroup = fieldEl.closest('.form-group');
                            formGroup.classList.add('error');
                            
                            let errorEl = formGroup.querySelector('.error-message');
                            if (!errorEl) {
                                errorEl = document.createElement('small');
                                errorEl.className = 'error-message';
                                formGroup.appendChild(errorEl);
                            }
                            errorEl.textContent = result.errors[field];
                        }
                    }
                } else {
                    Utils.showMessage(result.message, 'error');
                }
            }
        });

        // Clear errors on input
        registerForm.addEventListener('input', (e) => {
            const formGroup = e.target.closest('.form-group');
            if (formGroup.classList.contains('error')) {
                formGroup.classList.remove('error');
                const errorEl = formGroup.querySelector('.error-message');
                if (errorEl) {
                    errorEl.remove();
                }
            }
        });
    }

    // Forgot password form
    const forgotForm = document.getElementById('forgot-password-form');
    if (forgotForm) {
        forgotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(forgotForm);
            const phone = formData.get('phone');

            const result = Auth.forgotPassword(phone);
            
            if (result.success) {
                Utils.showMessage(result.message);
            } else {
                Utils.showMessage(result.message, 'error');
            }
        });
    }

    // Admin login form
    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(adminLoginForm);
            const username = formData.get('username');
            const password = formData.get('password');

            const result = Auth.adminLogin(username, password);
            
            if (result.success) {
                Utils.showMessage('Login realizado com sucesso!');
                document.getElementById('admin-login').style.display = 'none';
                document.getElementById('admin-panel').style.display = 'flex';
                Admin.loadOrders();
            } else {
                Utils.showMessage(result.message, 'error');
            }
        });
    }
});

// Navigation functions
function showLogin() {
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('register-page').style.display = 'none';
    document.getElementById('forgot-password-page').style.display = 'none';
}

function showRegister() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('register-page').style.display = 'flex';
    document.getElementById('forgot-password-page').style.display = 'none';
}

function showForgotPassword() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('register-page').style.display = 'none';
    document.getElementById('forgot-password-page').style.display = 'flex';
}

function logout() {
    Auth.logout();
    Utils.showMessage('Logout realizado com sucesso!');
    setTimeout(() => {
        App.showMainApp(); // Volta para o cardápio
    }, 1000);
}

function adminLogout() {
    Auth.logout();
    Utils.showMessage('Logout realizado com sucesso!');
    setTimeout(() => {
        window.location.href = '/';
    }, 1000);
}

// Initialize auth
Auth.init();