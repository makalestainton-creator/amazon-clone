import { orders } from "../data/orders.js";
import dayjs from "https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js";
import { formatCurrency } from "./utils/money.js";
import { getProduct, loadProducts } from "../data/products.js";
import {
  calculateCartQuantity,
  addToCart,
  loadFromStorage,
} from "../data/cart.js";

await loadProducts();
renderOrdersGrid();
updateCartQuantityDisplay();

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    loadFromStorage();
    updateCartQuantityDisplay();
  }
});

function updateCartQuantityDisplay() {
  document.querySelector(".js-cart-quantity").textContent =
    calculateCartQuantity();
}

document.querySelectorAll(".js-buy-again-button").forEach((btn) => {
  const productId = btn.dataset.productId;

  btn.addEventListener("click", () => {
    addToCart(productId, 1);

    updateCartQuantityDisplay();

    btn.innerHTML = "Added";
    setTimeout(() => {
      btn.innerHTML = `
          <img class="buy-again-icon" src="images/icons/buy-again.png">
          <span class="buy-again-message">Buy it again</span>
        `;
    }, 1000);
  });
});

document.querySelectorAll(".js-track-package-button").forEach((btn) => {
  const orderId = btn.closest(".js-details-grid").dataset.orderId;
  const productId = btn.dataset.productId;

  btn.addEventListener("click", () => {
    window.location.href = `tracking.html?orderId=${orderId}&productId=${productId}`;
  });
});

function renderOrdersGrid() {
  let ordersHtml = "";
  orders.forEach((order) => {
    const datePlaced = dayjs(order.orderTime).format("MMMM D");
    const totalCost = formatCurrency(order.totalCostCents);
    ordersHtml += `
      <div class="order-container">
        <div class="order-header">
          <div class="order-header-left-section">
            <div class="order-date">
              <div class="order-header-label">Order Placed:</div>
              <div>${datePlaced}</div>
            </div>
            <div class="order-total">
              <div class="order-header-label">Total:</div>
              <div>$${totalCost}</div>
            </div>
          </div>

          <div class="order-header-right-section">
            <div class="order-header-label">Order ID:</div>
            <div>${order.id}</div>
          </div>
        </div>

        <div class="order-details-grid js-details-grid" data-order-id="${order.id}">
          ${order.products
            .map((orderProduct) => {
              const product = getProduct(orderProduct.productId);

              const arrivalDate = dayjs(
                orderProduct.estimatedDeliveryTime,
              ).format("MMMM D");

              return `
              <div class="product-image-container">
                <img src="${product.image}">
              </div>

              <div class="product-details">
                <div class="product-name">
                  ${product.name}
                </div>
                <div class="product-delivery-date">
                  Arriving on: ${arrivalDate}
                </div>
                <div class="product-quantity">
                  Quantity: ${orderProduct.quantity}
                </div>
                <button class="buy-again-button js-buy-again-button button-primary" data-product-id="${orderProduct.productId}">
                  <img class="buy-again-icon" src="images/icons/buy-again.png">
                  <span class="buy-again-message">Buy it again</span>
                </button>
              </div>

              <div class="product-actions">
                <button class="track-package-button js-track-package-button button-secondary" data-product-id="${orderProduct.productId}">
                  Track package
                </button>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    `;
  });

  document.querySelector(".orders-grid").innerHTML = ordersHtml;
}

export function getOrder(orderId) {
  let matchingOrder;

  orders.forEach((order) => {
    if (order.id === orderId) matchingOrder = order;
  });

  return matchingOrder;
}
