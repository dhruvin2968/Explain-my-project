// Subscription.jsx
// Props: dark, onClose, onSelectPlan, currentPlan ("free"|"pro"), user

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "",
    tagline: "Get started, no card needed",
    credits: "3 lifetime generations",
    features: [
      "3 total project explanations",
      "Elevator Pitch only",
      "2 Interview Q&As per project",
      "Standard quality output",
    ],
    missing: [
      "All 5 output sections",
      "Unlimited generations",
      "PDF export",
      "LinkedIn post generator",
      "Priority AI responses",
    ],
    cta: "Current Plan",
    highlight: false,
  },
  {
    id: "pro_monthly",
    name: "Pro",
    price: "₹149",
    period: "/ month",
    tagline: "For active job seekers",
    credits: "Unlimited generations",
    badge: "Most Popular",
    features: [
      "Unlimited project explanations",
      "All 5 output sections",
      "Unlimited Interview Q&As",
      "Export to PDF",
      "LinkedIn post generator",
      "Priority AI responses",
      "Email support",
    ],
    missing: [],
    cta: "Upgrade to Pro",
    highlight: true,
  },
  {
    id: "pro_yearly",
    name: "Pro Yearly",
    price: "₹999",
    period: "/ year",
    tagline: "Best value — save ₹789",
    credits: "Unlimited generations",
    badge: "Best Value",
    features: [
      "Everything in Pro Monthly",
      "2 months free vs monthly",
      "Early access to new features",
      "Priority support",
    ],
    missing: [],
    cta: "Get Yearly Plan",
    highlight: false,
  },
];

const TickIcon = () => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);
const CrossIcon = () => (
  <svg className="w-3.5 h-3.5 shrink-0 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function Subscription({ dark, onClose, onSelectPlan, currentPlan = "free" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl transition-colors duration-300
        ${dark ? "bg-stone-950 border-stone-800 shadow-black" : "bg-white border-stone-200 shadow-stone-200"}`}>

        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b backdrop-blur-sm
          ${dark ? "border-stone-800 bg-stone-950/90" : "border-stone-100 bg-white/90"}`}>
          <div>
            <h2 className={`text-lg font-bold tracking-tight ${dark ? "text-stone-50" : "text-stone-900"}`}>
              Choose your plan
            </h2>
            <p className={`text-xs mt-0.5 ${dark ? "text-stone-500" : "text-stone-400"}`}>
              Upgrade to unlock unlimited generations and all features
            </p>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors duration-150
              ${dark ? "border-stone-700 text-stone-400 hover:bg-stone-800 hover:text-stone-200" : "border-stone-200 text-stone-400 hover:bg-stone-100 hover:text-stone-700"}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Plans grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const isCurrentFree = currentPlan === "free" && plan.id === "free";
            const isCurrentPro = currentPlan !== "free" && plan.id === currentPlan;
            const isCurrent = isCurrentFree || isCurrentPro;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border p-5 transition-all duration-200
                  ${plan.highlight
                    ? dark
                      ? "border-violet-600 bg-violet-950/40 shadow-lg shadow-violet-950/50"
                      : "border-violet-300 bg-violet-50/50 shadow-md shadow-violet-100"
                    : dark
                      ? "border-stone-800 bg-stone-900"
                      : "border-stone-200 bg-white"
                  }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full
                    ${plan.highlight
                      ? "bg-violet-600 text-white"
                      : dark ? "bg-amber-600 text-white" : "bg-amber-500 text-white"
                    }`}>
                    {plan.badge}
                  </div>
                )}

                {/* Plan name + price */}
                <div className="mb-4">
                  <h3 className={`text-sm font-semibold mb-1 ${dark ? "text-stone-200" : "text-stone-700"}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={`text-3xl font-bold tracking-tight ${dark ? "text-stone-50" : "text-stone-900"}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ${dark ? "text-stone-500" : "text-stone-400"}`}>{plan.period}</span>
                  </div>
                  <p className={`text-xs ${dark ? "text-stone-500" : "text-stone-400"}`}>{plan.tagline}</p>
                </div>

                {/* Credits callout */}
                <div className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg mb-4 text-center
                  ${plan.highlight
                    ? dark ? "bg-violet-800/50 text-violet-300" : "bg-violet-100 text-violet-700"
                    : dark ? "bg-stone-800 text-stone-400" : "bg-stone-100 text-stone-500"
                  }`}>
                  {plan.credits}
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-xs ${dark ? "text-stone-300" : "text-stone-600"}`}>
                      <span className={plan.highlight ? "text-violet-500" : dark ? "text-emerald-500" : "text-emerald-600"}>
                        <TickIcon />
                      </span>
                      {f}
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-xs ${dark ? "text-stone-600" : "text-stone-400"}`}>
                      <CrossIcon />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => !isCurrent && onSelectPlan(plan.id)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-200
                    ${isCurrent
                      ? dark ? "bg-stone-800 text-stone-600 cursor-default" : "bg-stone-100 text-stone-400 cursor-default"
                      : plan.highlight
                        ? "bg-violet-600 text-white hover:bg-violet-700 shadow-md shadow-violet-900/30"
                        : dark
                          ? "bg-stone-800 text-stone-200 border border-stone-700 hover:bg-stone-700"
                          : "bg-stone-900 text-white hover:bg-stone-800"
                    }`}
                >
                  {isCurrent ? "✓ Current Plan" : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className={`px-6 pb-6 text-center`}>
          <p className={`text-xs ${dark ? "text-stone-600" : "text-stone-400"}`}>
            All plans include secure payment via Razorpay · Cancel anytime · No hidden charges
          </p>
        </div>
      </div>
    </div>
  );
}