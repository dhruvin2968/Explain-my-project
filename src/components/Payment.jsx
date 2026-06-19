import React from "react";

const Payment = () => {

  const handlePayment = async () => {
    try {
      const res = await fetch("https://prepnpitch-backend.onrender.com/create-order", {
        method: "POST"
      });

      const order = await res.json();
const options = {
  key: "rzp_test_ScDsW5PacIYn5B",
  amount: order.amount,
  currency: order.currency,
  name: "Explain My Project",
  description: "Pro Plan",
  order_id: order.id,
  // ❌ REMOVE the method: {} block entirely — it does nothing
  handler: async function (response) {
    await fetch("https://prepnpitch-backend.onrender.com/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response)
    });
    alert("Payment Successful 🚀");
  },
  theme: { color: "#7c3aed" }
};

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      alert("Payment failed ❌");
    }
  };

  return (
    <div className="flex justify-center mt-6">
      <button
        onClick={handlePayment}
        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all"
      >
        Upgrade to Pro 🚀
      </button>
    </div>
  );
};

export default Payment;