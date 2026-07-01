import React from "react";

const API_URL = import.meta.env.VITE_API_URL;

const Payment = () => {

  const handlePayment = async () => {
    try {
      const res = await fetch(`${API_URL}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 9900, planId: "pro_monthly" }),
      });

      const order = await res.json();
      if (order.error) throw new Error(order.error);

      const cashfree = await window.Cashfree({ mode: import.meta.env.VITE_CASHFREE_ENV || "sandbox" });
      const result = await cashfree.checkout({
        paymentSessionId: order.payment_session_id,
        redirectTarget: "_modal",
      });

      if (result.error) throw new Error(result.error.message || "Payment cancelled.");

      if (result.paymentDetails) {
        await fetch(`${API_URL}/verify-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: order.order_id, planId: "pro_monthly" }),
        });
        alert("Payment Successful 🚀");
      }

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