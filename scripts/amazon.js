import {
  addToCart,
  calculateCartQuantity,
  loadFromStorage,
} from "../data/cart.js";
import { products as allProducts, loadProducts } from "../data/products.js";

function updateCartQuantityDisplay() {
  document.querySelector(".js-cart-quantity").textContent =
    calculateCartQuantity();
}

// Show the correct count right away, without waiting for products to load.
updateCartQuantityDisplay();

// If the user comes back with the browser's Back button, the page may be
// restored from memory with an out-of-date cart. Reload it from storage.
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    loadFromStorage();
    updateCartQuantityDisplay();
  }
});

await loadProducts();

// Read the search term from the URL (amazon.html?search=socks)
const url = new URL(window.location.href);
const searchTerm = (url.searchParams.get("search") || "").toLowerCase().trim();

let productsToShow = allProducts;

if (searchTerm) {
  productsToShow = allProducts.filter((product) => {
    const keywords = product.keywords || [];

    return (
      product.name.toLowerCase().includes(searchTerm) ||
      keywords.some((keyword) => keyword.toLowerCase().includes(searchTerm))
    );
  });

  // Keep the term visible in the search bar after the page reloads
  document.querySelector(".js-search-bar").value = searchTerm;
}

renderProductsGrid(productsToShow);
setUpSearch();

function setUpSearch() {
  const searchBar = document.querySelector(".js-search-bar");
  const searchBtn = document.querySelector(".js-search-btn");

  function runSearch() {
    const term = searchBar.value.trim();

    // An empty search takes you back to the full product list
    window.location.href = term
      ? `index.html?search=${encodeURIComponent(term)}`
      : "index.html";
  }

  searchBtn.addEventListener("click", runSearch);

  searchBar.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      runSearch();
    }
  });
}

function renderProductsGrid(products) {
  if (products.length === 0) {
    document.querySelector(".js-products-grid").innerHTML = `
      <p style="padding: 25px;">No products matched your search.</p>
    `;
    return;
  }

  let productsHTML = "";

  products.forEach((product) => {
    productsHTML += `
     <div class="product-container">
      <div class="product-image-container">
        <img class="product-image"
          src="${product.image}">
      </div>

      <div class="product-name limit-text-to-2-lines">
        ${product.name}
      </div>

      <div class="product-rating-container">
        <img class="product-rating-stars"
          src="${product.getStarsUrl()}">
        <div class="product-rating-count link-primary">
          ${product.rating.count}
        </div>
      </div>

      <div class="product-price">
        ${product.getPrice()}
      </div>

      <div class="product-quantity-container">
        <select class="js-quantity-selector-${product.id}">
          <option selected value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
        </select>
      </div>

      ${product.extraInfoHTML()}
      <div class="product-spacer"></div>

      <div class="added-to-cart js-added-to-cart-${product.id}">
        <img src="images/icons/checkmark.png">
        Added
      </div>

      <button class="add-to-cart-button button-primary js-add-to-cart"
      data-product-id="${product.id}">
        Add to Cart
      </button>
    </div>
  `;
  });

  document.querySelector(".js-products-grid").innerHTML = productsHTML;

  document.querySelectorAll(".js-add-to-cart").forEach((button) => {
    let timeoutId;
    button.addEventListener("click", () => {
      const productId = button.dataset.productId;
      const productQuantity = Number(
        document.querySelector(`.js-quantity-selector-${productId}`).value,
      );
      addToCart(productId, productQuantity);

      updateCartQuantityDisplay();

      const addedToCart = document.querySelector(
        `.js-added-to-cart-${productId}`,
      );

      addedToCart.classList.add("is-added-to-cart");

      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        addedToCart.classList.remove("is-added-to-cart");
      }, 2000);
    });
  });
}
