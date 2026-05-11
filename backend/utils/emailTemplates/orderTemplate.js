export const orderTemplate = (order) => `
  <div style="font-family:Arial;padding:20px">
    <h2>Order Confirmed 🐾</h2>
    <p><b>Order ID:</b> ${order._id}</p>
    <p><b>Total:</b> ₹${order.totalPrice}</p>
  </div>
`;