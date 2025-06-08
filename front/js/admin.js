// Admin Module
const Admin = {
    currentSection: 'pedidos',

    // Initialize admin panel
    init: () => {
        Admin.loadOrders();
        Admin.loadProducts();
        Admin.loadAdmins();
        Admin.loadConfig();
    },

    // Load orders for admin
    loadOrders: () => {
        const ordersContainer = document.getElementById('admin-orders');
        if (!ordersContainer) return;

        const orders = Utils.storage.get('orders') || [];
        const sortedOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (sortedOrders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="text-center">
                    <h4>Nenhum pedido encontrado</h4>
                    <p>Os pedidos aparecerão aqui quando forem realizados.</p>
                </div>
            `;
            return;
        }

        ordersContainer.innerHTML = sortedOrders.map(order => `
            <div class="admin-order ${order.status}">
                <div class="order-header">
                    <div class="order-id">${order.orderNumber}</div>
                    <div class="order-status ${order.status}">
                        ${Admin.getStatusLabel(order.status)}
                    </div>
                </div>
                
                <div class="order-details">
                    <div class="order-customer">
                        <div class="customer-info">
                            <strong>Cliente:</strong>
                            ${order.customer.name}
                        </div>
                        <div class="customer-info">
                            <strong>Telefone:</strong>
                            ${order.customer.phone}
                        </div>
                        <div class="customer-info">
                            <strong>Entrega:</strong>
                            ${order.isDelivery ? 'Delivery' : 'Retirada'}
                        </div>
                        <div class="customer-info">
                            <strong>Pagamento:</strong>
                            ${Admin.getPaymentLabel(order.paymentMethod)}
                        </div>
                        <div class="customer-info">
                            <strong>Data:</strong>
                            ${Utils.formatDate(order.createdAt)}
                        </div>
                        <div class="customer-info">
                            <strong>Total:</strong>
                            ${Utils.formatCurrency(order.total)}
                        </div>
                    </div>
                    
                    ${order.isDelivery ? `
                        <div class="customer-info">
                            <strong>Endereço:</strong>
                            ${order.customer.address}, ${order.customer.number}
                            ${order.customer.complement ? `, ${order.customer.complement}` : ''}
                            - ${order.customer.city}
                        </div>
                    ` : ''}
                    
                    <div class="order-items">
                        <strong>Itens:</strong>
                        ${order.items.map(item => `
                            <div class="order-item">
                                <span>
                                    ${item.quantity}x ${item.name}
                                    (${Utils.getQuantityLabel(item.quantityType, item.unitCount)})
                                </span>
                                <span>${Utils.formatCurrency(item.totalPrice)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="order-actions">
                    ${order.status === 'pending' ? `
                        <button class="btn btn-success" onclick="Admin.updateOrderStatus('${order.id}', 'confirmed')">
                            Confirmar
                        </button>
                        <button class="btn btn-danger" onclick="Admin.showRejectModal('${order.id}')">
                            Recusar
                        </button>
                    ` : ''}
                    
                    ${order.status === 'confirmed' ? `
                        <button class="btn btn-primary" onclick="Admin.updateOrderStatus('${order.id}', 'ready')">
                            Pronto
                        </button>
                    ` : ''}
                    
                    ${order.status === 'ready' ? `
                        <button class="btn btn-success" onclick="Admin.updateOrderStatus('${order.id}', 'delivered')">
                            Entregue
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    },

    // Get status label
    getStatusLabel: (status) => {
        const labels = {
            'pending': 'Aguardando Confirmação',
            'confirmed': 'Em Preparação',
            'ready': 'Pronto',
            'delivered': 'Entregue',
            'rejected': 'Recusado'
        };
        return labels[status] || status;
    },

    // Get payment label
    getPaymentLabel: (method) => {
        const labels = {
            'cash': 'Dinheiro',
            'card': 'Cartão',
            'pix': 'PIX'
        };
        return labels[method] || method;
    },

    // Update order status
    updateOrderStatus: (orderId, newStatus) => {
        const orders = Utils.storage.get('orders') || [];
        const orderIndex = orders.findIndex(order => order.id === orderId);
        
        if (orderIndex >= 0) {
            orders[orderIndex].status = newStatus;
            orders[orderIndex].statusHistory.push({
                status: newStatus,
                timestamp: new Date().toISOString(),
                description: Admin.getStatusLabel(newStatus)
            });
            
            Utils.storage.set('orders', orders);
            Admin.loadOrders();
            Utils.showMessage(`Pedido ${orders[orderIndex].orderNumber} atualizado para: ${Admin.getStatusLabel(newStatus)}`);
        }
    },

    // Show reject modal
    showRejectModal: (orderId) => {
        const reason = prompt('Motivo da recusa:');
        if (reason) {
            Admin.rejectOrder(orderId, reason);
        }
    },

    // Reject order
    rejectOrder: (orderId, reason) => {
        const orders = Utils.storage.get('orders') || [];
        const orderIndex = orders.findIndex(order => order.id === orderId);
        
        if (orderIndex >= 0) {
            orders[orderIndex].status = 'rejected';
            orders[orderIndex].rejectionReason = reason;
            orders[orderIndex].statusHistory.push({
                status: 'rejected',
                timestamp: new Date().toISOString(),
                description: `Pedido recusado: ${reason}`
            });
            
            Utils.storage.set('orders', orders);
            Admin.loadOrders();
            Utils.showMessage(`Pedido ${orders[orderIndex].orderNumber} foi recusado.`);
        }
    },

    // Load products for admin
    loadProducts: () => {
        const productsContainer = document.getElementById('admin-products');
        if (!productsContainer) return;

        const customItems = Utils.storage.get('customMenuItems') || [];
        const allItems = [...Menu.items, ...customItems];

        productsContainer.innerHTML = allItems.map(item => `
            <div class="admin-product">
                <div class="product-info">
                    <h4>${item.name}</h4>
                    <div class="product-price">
                        ${item.isPortioned ? Utils.formatCurrency(item.price) : Utils.formatCurrency(item.price) + ' / cento'}
                    </div>
                    <div class="product-category">${Menu.getCategoryName(item.category)}</div>
                    ${item.description ? `<p>${item.description}</p>` : ''}
                </div>
                <div class="product-actions">
                    ${item.id > 26 ? `
                        <button class="btn btn-secondary" onclick="Admin.editProduct(${item.id})">Editar</button>
                        <button class="btn btn-danger" onclick="Admin.deleteProduct(${item.id})">Excluir</button>
                    ` : `
                        <small>Item padrão</small>
                    `}
                </div>
            </div>
        `).join('');
    },

    // Show add product modal
    showAddProduct: () => {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content admin-modal">
                <div class="modal-header">
                    <h3>Adicionar Produto</h3>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <form id="add-product-form">
                    <div class="form-group">
                        <label for="product-name">Nome do Produto</label>
                        <input type="text" id="product-name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="product-price">Preço (R$)</label>
                        <input type="number" id="product-price" name="price" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="product-category">Categoria</label>
                        <select id="product-category" name="category" required>
                            <option value="salgados">Salgados Fritos</option>
                            <option value="sortidos">Sortidos</option>
                            <option value="assados">Assados</option>
                            <option value="especiais">Especiais</option>
                            <option value="opcionais">Opcionais</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="product-description">Descrição</label>
                        <textarea id="product-description" name="description" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="isPortioned"> Item vendido por porção
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Adicionar</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';

        // Handle form submission
        modal.querySelector('#add-product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const newProduct = {
                id: Date.now(),
                name: formData.get('name'),
                price: parseFloat(formData.get('price')),
                category: formData.get('category'),
                description: formData.get('description'),
                isPortioned: formData.has('isPortioned')
            };

            const customItems = Utils.storage.get('customMenuItems') || [];
            customItems.push(newProduct);
            Utils.storage.set('customMenuItems', customItems);

            Admin.loadProducts();
            Utils.showMessage('Produto adicionado com sucesso!');
            modal.remove();
        });
    },

    // Edit product
    editProduct: (productId) => {
        const customItems = Utils.storage.get('customMenuItems') || [];
        const product = customItems.find(item => item.id === productId);
        
        if (!product) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content admin-modal">
                <div class="modal-header">
                    <h3>Editar Produto</h3>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <form id="edit-product-form">
                    <div class="form-group">
                        <label for="product-name">Nome do Produto</label>
                        <input type="text" id="product-name" name="name" value="${product.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="product-price">Preço (R$)</label>
                        <input type="number" id="product-price" name="price" value="${product.price}" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="product-category">Categoria</label>
                        <select id="product-category" name="category" required>
                            <option value="salgados" ${product.category === 'salgados' ? 'selected' : ''}>Salgados Fritos</option>
                            <option value="sortidos" ${product.category === 'sortidos' ? 'selected' : ''}>Sortidos</option>
                            <option value="assados" ${product.category === 'assados' ? 'selected' : ''}>Assados</option>
                            <option value="especiais" ${product.category === 'especiais' ? 'selected' : ''}>Especiais</option>
                            <option value="opcionais" ${product.category === 'opcionais' ? 'selected' : ''}>Opcionais</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="product-description">Descrição</label>
                        <textarea id="product-description" name="description" rows="3">${product.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="isPortioned" ${product.isPortioned ? 'checked' : ''}> Item vendido por porção
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Salvar</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';

        // Handle form submission
        modal.querySelector('#edit-product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const productIndex = customItems.findIndex(item => item.id === productId);
            if (productIndex >= 0) {
                customItems[productIndex] = {
                    ...customItems[productIndex],
                    name: formData.get('name'),
                    price: parseFloat(formData.get('price')),
                    category: formData.get('category'),
                    description: formData.get('description'),
                    isPortioned: formData.has('isPortioned')
                };

                Utils.storage.set('customMenuItems', customItems);
                Admin.loadProducts();
                Utils.showMessage('Produto atualizado com sucesso!');
                modal.remove();
            }
        });
    },

    // Delete product
    deleteProduct: (productId) => {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            const customItems = Utils.storage.get('customMenuItems') || [];
            const filteredItems = customItems.filter(item => item.id !== productId);
            Utils.storage.set('customMenuItems', filteredItems);
            
            Admin.loadProducts();
            Utils.showMessage('Produto excluído com sucesso!');
        }
    },

    // Load admins
    loadAdmins: () => {
        const adminsContainer = document.getElementById('admin-admins');
        if (!adminsContainer) return;

        const admins = Utils.storage.get('adminUsers') || [];

        adminsContainer.innerHTML = admins.map(admin => `
            <div class="admin-admin">
                <div class="admin-info">
                    <h4>${admin.username}</h4>
                    <div class="admin-role">${admin.role}</div>
                </div>
                <div class="admin-actions">
                    ${admin.username !== 'sara' ? `
                        <button class="btn btn-danger" onclick="Admin.deleteAdmin('${admin.id}')">Excluir</button>
                    ` : `
                        <small>Administrador principal</small>
                    `}
                </div>
            </div>
        `).join('');
    },

    // Show add admin modal
    showAddAdmin: () => {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content admin-modal">
                <div class="modal-header">
                    <h3>Adicionar Administrador</h3>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <form id="add-admin-form">
                    <div class="form-group">
                        <label for="admin-username">Nome de Usuário</label>
                        <input type="text" id="admin-username" name="username" required>
                    </div>
                    <div class="form-group">
                        <label for="admin-password">Senha</label>
                        <input type="password" id="admin-password" name="password" required>
                    </div>
                    <div class="form-group">
                        <label for="admin-role">Função</label>
                        <select id="admin-role" name="role" required>
                            <option value="admin">Administrador</option>
                            <option value="manager">Gerente</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Adicionar</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';

        // Handle form submission
        modal.querySelector('#add-admin-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const newAdmin = {
                id: Utils.generateId(),
                username: formData.get('username'),
                password: formData.get('password'),
                role: formData.get('role'),
                createdAt: new Date().toISOString()
            };

            const admins = Utils.storage.get('adminUsers') || [];
            
            // Check if username already exists
            if (admins.find(admin => admin.username === newAdmin.username)) {
                Utils.showMessage('Nome de usuário já existe!', 'error');
                return;
            }

            admins.push(newAdmin);
            Utils.storage.set('adminUsers', admins);

            Admin.loadAdmins();
            Utils.showMessage('Administrador adicionado com sucesso!');
            modal.remove();
        });
    },

    // Delete admin
    deleteAdmin: (adminId) => {
        if (confirm('Tem certeza que deseja excluir este administrador?')) {
            const admins = Utils.storage.get('adminUsers') || [];
            const filteredAdmins = admins.filter(admin => admin.id !== adminId);
            Utils.storage.set('adminUsers', filteredAdmins);
            
            Admin.loadAdmins();
            Utils.showMessage('Administrador excluído com sucesso!');
        }
    },

    // Load configuration
    loadConfig: () => {
        const deliveryPriceInput = document.getElementById('delivery-price');
        if (!deliveryPriceInput) return;

        const config = Utils.storage.get('appConfig') || {};
        deliveryPriceInput.value = config.deliveryFee || 10.00;
    },

    // Update delivery price
    updateDeliveryPrice: () => {
        const deliveryPriceInput = document.getElementById('delivery-price');
        const newPrice = parseFloat(deliveryPriceInput.value) || 0;

        const config = Utils.storage.get('appConfig') || {};
        config.deliveryFee = newPrice;
        Utils.storage.set('appConfig', config);

        Utils.showMessage('Valor da entrega atualizado com sucesso!');
    }
};

// Global functions
function showAdminSection(section) {
    Admin.currentSection = section;
    
    // Update active button
    document.querySelectorAll('.admin-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(`admin-${section}`).style.display = 'block';
    
    // Load section data
    switch (section) {
        case 'pedidos':
            Admin.loadOrders();
            break;
        case 'produtos':
            Admin.loadProducts();
            break;
        case 'administradores':
            Admin.loadAdmins();
            break;
        case 'configuracoes':
            Admin.loadConfig();
            break;
    }
}

function showAddProduct() {
    Admin.showAddProduct();
}

function showAddAdmin() {
    Admin.showAddAdmin();
}

function updateDeliveryPrice() {
    Admin.updateDeliveryPrice();
}

// Initialize admin when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('admin-page')) {
        Admin.init();
    }
});