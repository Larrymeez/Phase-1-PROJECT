document.addEventListener("DOMContentLoaded", () => {
    fetchPhones();
});

let allPhones = []; // Store all phones for filtering
let cart = []; // Store cart items

function fetchPhones() {
    fetch("https://dummyjson.com/products/category/smartphones")
        .then(response => response.json())
        .then(data => {
            allPhones = data.products; // Store all phones
            populateBrandFilter();
            displayPhones(allPhones);
        })
        .catch(error => console.error("Error fetching phones:", error));
}

function populateBrandFilter() {
    const brandFilter = document.getElementById("brand-filter");
    brandFilter.innerHTML = '<option value="all">All</option>';
    const brands = [...new Set(allPhones.map(phone => phone.brand))]; // Unique brands

    brands.forEach(brand => {
        const option = document.createElement("option");
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
    });
}

function displayPhones(phones) {
    const productContainer = document.getElementById("product-container");
    productContainer.innerHTML = "";

    phones.forEach(phone => {
        const phoneCard = document.createElement("div");
        phoneCard.classList.add("product");

        phoneCard.innerHTML = `
            <h3>${phone.title}</h3>
            <img src="${phone.thumbnail}" alt="${phone.title}" width="150">
            <p>Brand: ${phone.brand}</p>
            <p>Price: KES ${phone.price}</p>
            <p>Rating: ⭐${phone.rating}</p>
            <button onclick="viewDetails(${phone.id})">View Details</button>
            <button onclick="addToCart(${phone.id}, '${phone.title}', ${phone.price})">Add to Cart</button>
        `;
        productContainer.appendChild(phoneCard);
    });
}

function viewDetails(productId) {
    fetch(`https://dummyjson.com/products/${productId}`)
        .then(response => response.json())
        .then(product => {
            document.getElementById("modal-title").textContent = product.title;
            document.getElementById("modal-image").src = product.thumbnail;
            document.getElementById("modal-price").textContent = `💰 Price: KES ${product.price}`;
            document.getElementById("modal-description").textContent = `⚙️ Specs: ${product.description}`;
            document.getElementById("modal-rating").textContent = `⭐ Rating: ${product.rating}`;
            document.getElementById("modal-brand").textContent = `🏭 Brand: ${product.brand}`;
            document.getElementById("product-modal").style.display = "flex";
            selectedProduct = { id: product.id, title: product.title, price: product.price };
        })
        .catch(error => console.error("Error fetching product details:", error));
}

function closeModal() {
    document.getElementById("product-modal").style.display = "none";
}

let selectedProduct = null;

function addToCartFromModal() {
    if (selectedProduct) {
        addToCart(selectedProduct.id, selectedProduct.title, selectedProduct.price);
        closeModal();
    }
}

function addToCart(id, title, price) {
    let existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, title, price, quantity: 1 });
    }

    updateCart();
}

function updateCart() {
    const cartItems = document.getElementById("cart-items");
    const totalPrice = document.getElementById("total-price");
    const cartCount = document.getElementById("cart-count");

    cartItems.innerHTML = "";
    let total = 0;
    let itemCount = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        itemCount += item.quantity;

        const li = document.createElement("li");
        li.innerHTML = `
            ${item.title} - KES ${item.price} x ${item.quantity} 
            <button onclick="removeFromCart(${item.id})">❌</button>
        `;
        cartItems.appendChild(li);
    });

    totalPrice.textContent = total.toFixed(2);
    cartCount.textContent = itemCount;
}

function removeFromCart(id) {
    let item = cart.find(item => item.id === id);
    if (item) {
        if (item.quantity > 1) {
            item.quantity--;
        } else {
            cart = cart.filter(item => item.id !== id);
        }
    }
    updateCart();
}

document.getElementById("cart-toggle").addEventListener("click", () => {
    const cartContainer = document.getElementById("cart-container");
    cartContainer.style.display = cartContainer.style.display === "block" ? "none" : "block";
});

document.getElementById("search-box").addEventListener("input", applyFilters);
document.getElementById("brand-filter").addEventListener("change", applyFilters);
document.getElementById("price-filter").addEventListener("change", applyFilters);
document.getElementById("rating-filter").addEventListener("change", applyFilters);

function applyFilters() {
    let filteredPhones = [...allPhones];
    const brand = document.getElementById("brand-filter").value;
    const price = document.getElementById("price-filter").value;
    const rating = document.getElementById("rating-filter").value;
    const searchQuery = document.getElementById("search-box").value.toLowerCase();

    if (brand !== "all") {
        filteredPhones = filteredPhones.filter(phone => phone.brand === brand);
    }

    if (price !== "all") {
        filteredPhones = filteredPhones.filter(phone => {
            if (price === "low") return phone.price < 20000;
            if (price === "mid") return phone.price >= 20000 && phone.price <= 50000;
            if (price === "high") return phone.price > 50000;
        });
    }

    if (rating !== "all") {
        filteredPhones = filteredPhones.filter(phone => phone.rating >= parseFloat(rating));
    }

    if (searchQuery.trim() !== "") {
        filteredPhones = filteredPhones.filter(phone => phone.title.toLowerCase().includes(searchQuery));
    }

    displayPhones(filteredPhones);
}
