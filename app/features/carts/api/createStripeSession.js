import { STRIPE_SESSION_URL } from '@/config'

export const purchase = async ({ cart }) => {
  fetch(STRIPE_SESSION_URL, {
    method: 'POST',
    body: JSON.stringify({ cart: cart })
  })
  .then(response => response.json())
  .then(response => {
    window.location.href = response.session.url // Redirect to Stripe Checkout
  }).catch(error => {
    console.error(error)
  })
}