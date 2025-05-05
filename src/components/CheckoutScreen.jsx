import React, { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useSolarAssistant } from "../context/SolarAssistantContext";

const ProductLineItem = ({ product }) => {
  const { t } = useSolarAssistant();
  const [quantity, setQuantity] = useState(product.quantity);

  return (
    <div className="flex items-start space-x-3 border border-yellow-100 rounded-lg p-3 mb-3">
      <div className="w-16 h-16 bg-white rounded border border-yellow-200 flex items-center justify-center overflow-hidden">
        <img
          src={product.imageUrl || `/product-${product.type}.png`}
          alt={product.name}
          className="w-full h-full object-contain"
        />
      </div>

      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{product.name}</h4>
        <p className="text-sm text-gray-600">
          {product.warranty} {t.warranty}
        </p>

        <div className="flex items-center mt-2">
          <span className="text-sm mr-2">{t.quantity}:</span>

          <div className="relative">
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-1 focus:outline-none focus:ring-1 focus:ring-yellow-500"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddressSection = ({ address, onChangeClick }) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">1. Address</h3>
        <button
          onClick={onChangeClick}
          className="text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          Change
        </button>
      </div>

      <div className="bg-gray-50 p-3 rounded-md">
        <p className="font-medium">{address.name}</p>
        <p>{address.street}</p>
        <p>
          {address.city}, {address.state}
        </p>
        <p>{address.zipCode}</p>
      </div>
    </div>
  );
};

const PaymentMethodSection = ({
  selectedMethod,
  onSelectMethod,
  onChangeClick,
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">2. Payment Method</h3>
        <button
          onClick={onChangeClick}
          className="text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          Change
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-md">
          <div className="relative">
            <input
              type="radio"
              id="debit-card"
              name="payment-method"
              className="sr-only"
              checked={selectedMethod === "debit-card"}
              onChange={() => onSelectMethod("debit-card")}
            />
            <div
              className={`w-5 h-5 rounded-full border ${
                selectedMethod === "debit-card"
                  ? "border-gray-800 bg-gray-800"
                  : "border-gray-400"
              }`}
            >
              {selectedMethod === "debit-card" && (
                <Check size={14} className="text-white" />
              )}
            </div>
          </div>
          <label htmlFor="debit-card" className="flex-1 cursor-pointer">
            Add a debit card
          </label>
        </div>

        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-md">
          <div className="relative">
            <input
              type="radio"
              id="pay-small"
              name="payment-method"
              className="sr-only"
              checked={selectedMethod === "pay-small"}
              onChange={() => onSelectMethod("pay-small")}
            />
            <div
              className={`w-5 h-5 rounded-full border ${
                selectedMethod === "pay-small"
                  ? "border-gray-800 bg-gray-800"
                  : "border-gray-400"
              }`}
            >
              {selectedMethod === "pay-small" && (
                <Check size={14} className="text-white" />
              )}
            </div>
          </div>
          <label htmlFor="pay-small" className="flex-1 cursor-pointer">
            Pay small-small
          </label>
        </div>
      </div>
    </div>
  );
};

const ReviewItemsSection = ({ products, onRecalculate }) => {
  const { t } = useSolarAssistant();

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">3. {t.reviewItems}</h3>
        <button
          onClick={onRecalculate}
          className="text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          {t.recalculate}
        </button>
      </div>

      <div className="space-y-3">
        {products.map((product) => (
          <ProductLineItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

const CheckoutScreen = () => {
  const { state, actions, t } = useSolarAssistant();
  const { orderDetails, products } = state;
  const [paymentMethod, setPaymentMethod] = useState("debit-card");

  // Format currency with Naira symbol
  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  // Handle place order button click
  const handlePlaceOrder = () => {
    // Update order details with payment method
    actions.updateOrderDetails({
      paymentMethod,
    });

    // Navigate to receipt screen if paid at once, or to financing flow if pay-small
    if (paymentMethod === "debit-card") {
      actions.setView("receipt");
    } else {
      actions.setView("financing");
    }
  };

  // Continue to application button
  const handleContinueToApplication = () => {
    actions.updateOrderDetails({
      paymentMethod,
    });
    actions.setView("financing");
  };

  // Handle address change
  const handleAddressChange = () => {
    // In a real app, this would show an address form
    console.log("Show address form");
  };

  // Handle payment method change
  const handlePaymentMethodChange = () => {
    // In a real app, this might show payment method options
    console.log("Show payment method options");
  };

  // Handle recalculate
  const handleRecalculate = () => {
    // In a real app, this would recalculate the order total
    console.log("Recalculating order...");
  };

  return (
    <div className="fixed inset-0 bg-white overflow-y-auto z-50">
      <div className="max-w-md mx-auto p-4">
        <h2 className="text-xl font-bold mb-4">{t.orderSummary}</h2>

        {/* Order summary */}
        <div className="mb-6">
          <div className="flex justify-between py-2">
            <span>{t.itemsInstallation}</span>
            <span>{formatCurrency(orderDetails.totalBeforeTax)}</span>
          </div>

          <div className="flex justify-between py-2">
            <span>{t.totalBeforeTax}</span>
            <span>{formatCurrency(orderDetails.totalBeforeTax)}</span>
          </div>

          <div className="flex justify-between py-2">
            <span>{t.tax}</span>
            <span>{formatCurrency(orderDetails.tax)}</span>
          </div>

          <div className="flex justify-between py-2 border-t border-gray-200 text-red-600 font-bold">
            <span>{t.orderTotal}</span>
            <span>{formatCurrency(orderDetails.orderTotal)}</span>
          </div>
        </div>

        {/* Address section */}
        <AddressSection
          address={orderDetails.address}
          onChangeClick={handleAddressChange}
        />

        {/* Payment method section */}
        <PaymentMethodSection
          selectedMethod={paymentMethod}
          onSelectMethod={setPaymentMethod}
          onChangeClick={handlePaymentMethodChange}
        />

        {/* Review items section */}
        <ReviewItemsSection
          products={products}
          onRecalculate={handleRecalculate}
        />

        {/* Installation message */}
        <div className="text-sm text-gray-600 mb-4">
          {t.installationMessage}
        </div>

        {/* Action buttons */}
        {paymentMethod === "pay-small" ? (
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">{t.applyFinancing}</div>
            <button
              onClick={handleContinueToApplication}
              className="w-full bg-gray-800 text-white py-3 rounded-full hover:bg-gray-700 transition-colors"
            >
              {t.continueApplication}
            </button>
          </div>
        ) : (
          <button
            onClick={handlePlaceOrder}
            className="w-full bg-gray-800 text-white py-3 rounded-full hover:bg-gray-700 transition-colors"
          >
            {t.placeOrder}
          </button>
        )}

        {/* Back to voice interface */}
        <div className="mt-4 text-center">
          <button
            onClick={() => actions.setView("voice")}
            className="text-gray-600 hover:text-gray-900"
          >
            Return to voice assistant
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutScreen;
