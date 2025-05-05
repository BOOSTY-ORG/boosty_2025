import React from "react";
import { X, Mic, Download } from "lucide-react";
import { useSolarAssistant } from "../context/SolarAssistantContext";
import { useWebSpeech } from "../services/WebSpeechService";

/**
 * ReceiptScreen component displays the order confirmation and invoice details
 */
const ReceiptScreen = () => {
  const { state, actions, t } = useSolarAssistant();
  const { orderDetails } = state;
  const { speak, startListening, stopListening } = useWebSpeech();

  // Format currency with Naira symbol
  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  // Handle download invoice button click
  const handleDownloadInvoice = () => {
    // In a real app, this would trigger a PDF download
    console.log("Downloading invoice...");
    speak("Your invoice has been downloaded. Thank you for your order!");
  };

  // Handle close button click
  const handleCloseClick = () => {
    stopListening();
    actions.setView("landing");
  };

  // Speak a welcome message when the component mounts
  React.useEffect(() => {
    const timer = setTimeout(() => {
      speak(
        "Thank you for your order! Your installation will be scheduled within 1 to 2 weeks. You can download your invoice and receipt using the button below."
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [speak]);

  return (
    <div className="fixed inset-0 bg-yellow-400 flex flex-col items-center p-4 z-50">
      {/* Top section with voice visualization */}
      <div className="w-full flex justify-center items-center mb-8 relative">
        <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center shadow-md">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((bar, index) => (
              <div
                key={index}
                className="bg-yellow-600 w-1.5 rounded-full"
                style={{ height: `${10 + index * 2}px` }}
              />
            ))}
          </div>
        </div>

        {/* Control buttons */}
        <div className="absolute bottom-0 flex space-x-4 mt-4">
          <button
            onClick={handleCloseClick}
            className="bg-yellow-500 hover:bg-yellow-600 rounded-full p-3 transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-gray-800" />
          </button>
          <button
            onClick={startListening}
            className="bg-yellow-500 hover:bg-yellow-600 rounded-full p-3 transition-colors"
            aria-label="Start listening"
          >
            <Mic size={20} className="text-gray-800" />
          </button>
        </div>
      </div>

      {/* Receipt card */}
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-2">
          Order #{orderDetails.orderNumber}
        </h2>

        {/* Order summary */}
        <div className="mb-4">
          <div className="flex justify-between py-2">
            <span>Items + installation:</span>
            <span>{formatCurrency(orderDetails.totalBeforeTax)}</span>
          </div>

          <div className="flex justify-between py-2">
            <span>Total before tax:</span>
            <span>{formatCurrency(orderDetails.totalBeforeTax)}</span>
          </div>

          <div className="flex justify-between py-2">
            <span>Tax:</span>
            <span>{formatCurrency(orderDetails.tax)}</span>
          </div>

          <div className="flex justify-between py-2 border-t border-gray-200">
            <span className="font-bold">Order Total:</span>
            <span className="font-bold">
              {formatCurrency(orderDetails.orderTotal)}
            </span>
          </div>
        </div>

        {/* Delivery address */}
        <div className="mb-4">
          <h3 className="font-medium">{orderDetails.address.name}</h3>
          <p className="text-gray-600">
            {orderDetails.address.street}, {orderDetails.address.city},{" "}
            {orderDetails.address.state}, {orderDetails.address.zipCode}
          </p>
        </div>

        {/* Order dates */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Date created</p>
            <p>{orderDetails.dateCreated}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Invoice number</p>
            <p>{orderDetails.invoiceNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date paid</p>
            <p>{orderDetails.datePaid}</p>
          </div>
        </div>

        {/* Download button */}
        <button
          onClick={handleDownloadInvoice}
          className="w-full flex items-center justify-center space-x-2 bg-gray-800 text-white py-3 rounded-full hover:bg-gray-700 transition-colors"
        >
          <Download size={18} />
          <span>{t.downloadInvoice}</span>
        </button>
      </div>
    </div>
  );
};

export default ReceiptScreen;
