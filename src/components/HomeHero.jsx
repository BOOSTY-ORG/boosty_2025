import AIAssistantCard from "./AiAssitant";

const HomeHero = () => {
  const showConsole = () => {
    console.log("Hero AI Assitant Clicked");
  };
  return (
    <section className="bg-boostyYellow min-h-max sm:min-h-[428px] px-5 md:px-[108px] lg:px-[229px] flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-[82px] mt-[65px] py-12 md:py-20 lg:py-0">
      <div>
        <h1 className="text-[40px] font-bold leading-[50px] text-[#2B2D2C]">
          Need solar? Just talk to the AI assistant{" "}
          <span className="hidden lg:inline-block">👉🏾</span>{" "}
          <span className="lg:hidden">👇🏾</span>
        </h1>
        <p className="text-lg font-semibold leading-6 mt-4 w-full md:w-[90%]">
          Say what you need. The assistant will help you choose a system, find
          payment options, and book your installation.
        </p>
      </div>

      {/* <div className="min-w-[95vw] md:min-w-[70vw] lg:min-w-[460px] bg-white px-2 lg:px-[40px] py-[48px] rounded-2xl shadow-lg">
        <div className="flex items-center justify-center gap-1 sm:gap-6">
          <img
            src="/boosty_eye.gif"
            alt="Boosty Watches Out For Yah!!!"
            className="w-10 sm:w-[59px] h-10 sm:h-[59px]"
          />

          <div className="bg-boostyBlack text-boostyYellow min-h-[44px] min-w-max lg:min-w-[296px] flex items-center justify-center gap-2 rounded-full px-4">
            <img src="/soundwave.svg" alt="Interact with our AI" />
            <span className="text-base lg:text-lg font-bold leading-7">
              Tap here to start talking
            </span>
          </div>
        </div>
      </div> */}
      <AIAssistantCard
        buttonText="Tap here to start talking"
        onStartTalking={() => {
          showConsole();
        }}
      />
    </section>
  );
};

export default HomeHero;
