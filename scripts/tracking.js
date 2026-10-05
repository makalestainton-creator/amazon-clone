import { getOrder } from "../data/orders.js";
import { getProduct, loadProducts } from "../data/products.js";
import { calculateCartQuantity } from "../data/cart.js";
import dayjs from "https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js";

loadPage();

async function loadPage() {
  await loadProducts();

  const url = new URL(window.location.href);
  const orderId = url.searchParams.get("orderId");
  const productId = url.searchParams.get("productId");

  const order = getOrder(orderId);
  const product = getProduct(productId);

  document.querySelector(".js-cart-quantity").textContent =
    calculateCartQuantity();

  if (!order || !product) {
    document.querySelector(".js-order-tracking").innerHTML = `
    <a class="back-to-orders-link link-primary" href="orders.html">
      View all orders
    </a>
    <p>Sorry, we couldn't find that order.</p>
  `;
    return;
  }

  let productDetails;
  order.products.forEach((details) => {
    if (details.productId === product.id) {
      productDetails = details;
    }
  });

  const today = dayjs();
  const orderTime = dayjs(order.orderTime);
  const deliveryTime = dayjs(productDetails.estimatedDeliveryTime);
  const percentProgress =
    ((today - orderTime) / (deliveryTime - orderTime)) * 100;

  const trackingHTML = `
    <a class="back-to-orders-link link-primary" href="orders.html">
      View all orders
    </a>

    <div class="delivery-date">Arriving on ${dayjs(productDetails.estimatedDeliveryTime).format("dddd, MMMM D")}</div>

    <div class="product-info">
      ${product.name}
    </div>

    <div class="product-info">Quantity: ${productDetails.quantity}</div>

    <img
      class="product-image"
      src="${product.image}"
    />

    <div class="progress-labels-container">
      <div class="progress-label ${percentProgress < 50 ? 'current-status' : ''}">Preparing</div>
      <div class="progress-label ${(percentProgress >= 50 && percentProgress < 100) ? 'current-status' : ''}">Shipped</div>
      <div class="progress-label ${percentProgress >= 100 ? "current-status" : ''}">Delivered</div>
    </div>

    <div class="progress-bar-container">
      <div class="progress-bar" style="width: ${percentProgress}%"></div>
    </div>
  `;

  document.querySelector(".js-order-tracking").innerHTML = trackingHTML;
}
