document.addEventListener('DOMContentLoaded', function() {
    let cartItems = document.getElementById('cartItems');
    let totalPrice = document.getElementById('totalPrice');
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];

    function updateTotal() {
        let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalPrice.textContent = total.toFixed(2);
    }

    function renderCart() {
        cartItems.innerHTML = '';

        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart-message">
                <img src="./images/emptycart.png" alt="">
                </div>
            `;
            totalPrice.textContent = '0.00';
            return;
        }

        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" class="cart-item-image">
                <div class="cart-item-info">
                    <h1 class =" iname">${item.name}</h1>
                    <p>$${item.price}</p>
                    <div class="quantity-controls">
                        <button onclick="changeQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity(${item.id}, 1)">+</button>
                    </div>
                    <button onclick="removeItem(${item.id})" class="remove-btn">Remove</button>
                </div>
            </div>
        `).join('');
        
        updateTotal();
    }

    window.changeQuantity = function(id, change) {
        let item = cart.find(i => i.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity < 1) item.quantity = 1;
            
            fetch('https://restaurant.stepprojects.ge/api/Baskets/UpdateBasket', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: id,
                    quantity: item.quantity
                })
            });

            sessionStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
        }
    };

    window.removeItem = function(id) {
        cart = cart.filter(i => i.id !== id);
        
        fetch(`https://restaurant.stepprojects.ge/api/Baskets/DeleteProduct/${id}`, {
            method: 'DELETE'
        });

        sessionStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    };

    renderCart();
});