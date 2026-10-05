import { renderOrderSummary } from "./checkout/orderSummary.js";
import { renderPaymentSummary } from "./checkout/paymentSummary.js";
import { loadProducts } from "../data/products.js";
import { loadCart, loadFromStorage } from "../data/cart.js";

// If the page is restored from the back/forward cache, its cart is stale.
// Reload it from storage and draw the page again.
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    loadFromStorage();
    renderOrderSummary();
    renderPaymentSummary();
  }
});

async function loadPage() {
  try {
    await loadProducts();

    await new Promise((resolve, reject) => {
      loadCart(() => {
        resolve();
      });
    });
  } catch (error) {
    console.error(error);
  }

  // renderOrderSummary() also updates the "N items" link in the header.
  renderOrderSummary();
  renderPaymentSummary();
}

loadPage();
