import {
  cart,
  removeFromCart,
  updateDeliveryOption,
  updateQuantity,
} from "../../data/cart.js";
import { getProduct } from "../../data/products.js";
import { formatCurrency } from "../utils/money.js";
import {
  deliveryOptions,
  getDeliveryOption,
} from "../../data/deliveryOptions.js";
import dayjs from "https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js";
import { renderPaymentSummary } from "./paymentSummary.js";
import { renderCheckoutHeader } from "./checkoutHeader.js";

function isWeekend(date) {
  const dayOfWeek = date.format("dddd");

  return dayOfWeek === "Saturday" || dayOfWeek === "Sunday";
}

export function renderOrderSummary() {
  let cartSummaryHTML = "";

  cart.forEach((cartItem) => {
    const productId = cartItem.productId;
    const matchingProduct = getProduct(productId);

    const deliveryOptionId = cartItem.deliveryOptionId;

    const deliveryOption = getDeliveryOption(deliveryOptionId);

    let remainingDays = deliveryOption.deliveryDays;
    let deliveryDate = dayjs();

    while (remainingDays > 0) {
      deliveryDate = deliveryDate.add(1, "day");

      if (!isWeekend(deliveryDate)) remainingDays--;
    }

    const dateString = deliveryDate.format("dddd, MMMM D");

    cartSummaryHTML += `
      <div class="cart-item-container 
      js-cart-item-container
      js-cart-item-container-${matchingProduct.id}">
          <div class="delivery-date">
            Delivery date: ${dateString}
          </div>

          <div class="cart-item-details-grid">
            <img class="product-image"
              src="${matchingProduct.image}">

            <div class="cart-item-details">
              <div class="product-name">
                ${matchingProduct.name}
              </div>
              <div class="product-price">
                ${matchingProduct.getPrice()}
              </div>
              <div class="product-quantity js-product-quantity-${matchingProduct.id}">
                <span>
                  Quantity: <span class="quantity-label">${
                    cartItem.quantity
                  }</span>
                </span>
                <span class="update-quantity-link js-update-quantity-link link-primary" data-product-id="${matchingProduct.id}">
                  Update
                </span>
                <span class="delete-quantity-link 
                js-delete-link-${matchingProduct.id} link-primary js-delete-link" data-product-id="${
                  matchingProduct.id
                }">
                  Delete
                </span>
                <input class="quantity-input js-quantity-input-${matchingProduct.id}" type="number" min="1" max="100" value="${cartItem.quantity}">
                <span class="js-save-quantity-link save-quantity-link link-primary" data-product-id="${matchingProduct.id}">Save</span>
              </div>
            </div>

            <div class="delivery-options js-delivery-options">
              <div class="delivery-options-title">
                Choose a delivery option:
              </div>
            ${deliveryOptionsHTML(matchingProduct, cartItem)}
            </div>
          </div>
      </div>
    `;
  });

  function deliveryOptionsHTML(matchingProduct, cartItem) {
    let html = "";
    deliveryOptions.forEach((deliveryOption) => {
      let remainingDays = deliveryOption.deliveryDays;
      let deliveryDate = dayjs();

      while (remainingDays > 0) {
        deliveryDate = deliveryDate.add(1, "day");

        if (!isWeekend(deliveryDate)) remainingDays--;
      }
      
      const dateString = deliveryDate.format("dddd, MMMM D");

      const priceString =
        deliveryOption.PriceCents === 0
          ? "FREE"
          : `$${formatCurrency(deliveryOption.PriceCents)} -`;

      const isChecked = deliveryOption.id === cartItem.deliveryOptionId;

      html += `
        <div class="delivery-option js-delivery-option"
        data-product-id="${matchingProduct.id}"
        data-delivery-option-id="${deliveryOption.id}">
          <input type="radio"
          ${isChecked ? "checked" : ""}
            class="delivery-option-input"
            name="delivery-option-${matchingProduct.id}">
          <div>
            <div class="delivery-option-date">
              ${dateString}
            </div>
            <div class="delivery-option-price">
              ${priceString} Shipping
            </div>
          </div>
        </div>
        
      `;
    });

    return html;
  }

  if (cart.length === 0) {
    cartSummaryHTML = `
      <p>Your cart is empty.</p>
      <a class="view-products-link link-primary" href="amazon.html">
        View products
      </a>
    `;
  }

  document.querySelector(".js-order-summary").innerHTML = cartSummaryHTML;

  // Keep the "N items" link in the checkout header in sync on every render.
  renderCheckoutHeader();

  document
    .querySelectorAll(".js-update-quantity-link")
    .forEach((updateLink) => {
      updateLink.addEventListener("click", () => {
        const productId = updateLink.dataset.productId;
        const container = document.querySelector(
          `.js-cart-item-container-${productId}`,
        );

        container.classList.add("is-editing-quantity");
      });
    });

  document.querySelectorAll(".js-save-quantity-link").forEach((link) => {
    link.addEventListener("click", () => {
      const productId = link.dataset.productId;
      const quantityInput = document.querySelector(
        `.js-quantity-input-${productId}`,
      );
      const newQuantity = Number(quantityInput.value);

      if (
        !Number.isInteger(newQuantity) ||
        newQuantity < 1 ||
        newQuantity > 100
      ) {
        alert("Quantity must be a whole number between 1 and 100");
        return; // stay in edit mode so the user can correct it
      }

      updateQuantity(productId, newQuantity);

      // Re-rendering rebuilds the HTML, which also exits edit mode.
      renderOrderSummary();
      renderPaymentSummary();
    });
  });

  document.querySelectorAll(".js-delete-link").forEach((link) => {
    link.addEventListener("click", () => {
      const productId = link.dataset.productId;
      removeFromCart(productId);

      renderOrderSummary();
      renderPaymentSummary();
    });
  });

  document.querySelectorAll(".js-delivery-option").forEach((element) => {
    element.addEventListener("click", () => {
      const { productId, deliveryOptionId } = element.dataset;
      updateDeliveryOption(productId, deliveryOptionId);
      renderOrderSummary();
      renderPaymentSummary();
    });
  });
}
