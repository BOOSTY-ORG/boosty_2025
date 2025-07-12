import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import ApplianceFormModal from "./AppliancesFormModal";

const AIAssistantCard = ({
  buttonText = "Add Appliance",
  containerClassName = "",
  onStartTalking = () => {},
  onApplianceAdded = (applianceData) => {
    // Parent component can handle what to do with the appliance data
    console.log("Appliance added:", applianceData);
  },
}) => {
  const [showFormModal, setShowFormModal] = useState(false);
  const { user } = useUser();

  const handleOpenForm = () => {
    setShowFormModal(true);
    onStartTalking();
  };

  const handleCloseForm = () => {
    setShowFormModal(false);
  };

  const handleApplianceAdded = (applianceData) => {
    // Pass the appliance data to parent component
    onApplianceAdded(applianceData);
    // Keep modal open so user can add another appliance if needed
    // They can close it manually when done
  };

  return (
    <>
      <div
        className={`min-w-[95vw] md:min-w-[70vw] lg:min-w-[460px] bg-white px-2 lg:px-[40px] py-[48px] rounded-2xl shadow-lg ${containerClassName}`}
      >
        <div className="flex items-center justify-center gap-1 sm:gap-6">
          <img
            src="/boosty_eye.gif"
            alt="Boosty Watches Out For Yah!!!"
            className="w-10 sm:w-[59px] h-10 sm:h-[59px]"
          />

          <button
            onClick={handleOpenForm}
            className="bg-boostyBlack text-boostyYellow min-h-[44px] min-w-max lg:min-w-[296px] flex items-center justify-center gap-2 rounded-full px-4 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <img src="/soundwave.svg" alt="Add your appliances" />
            <span className="text-base lg:text-lg font-bold leading-7">
              {buttonText}
            </span>
          </button>
        </div>
      </div>

      {/* Appliance Form Modal */}
      {showFormModal && (
        <ApplianceFormModal
          user={user}
          onClose={handleCloseForm}
          onApplianceAdded={handleApplianceAdded}
        />
      )}
    </>
  );
};

export default AIAssistantCard;
