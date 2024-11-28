export default function Gauge() {
  return (
    <div className="flex justify-center items-center mb-8">
      <div className="relative w-[300px] h-[300px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[250px] h-[250px] rounded-full border-4 border-[#333] flex items-center justify-center">
            <div className="text-4xl text-[#ff0000] font-bold">45</div>
          </div>
          <div
            className="absolute w-[4px] h-[120px] bg-[#ff0000] origin-bottom transform -rotate-45"
            style={{
              bottom: "50%",
              left: "calc(50% - 2px)",
              transformOrigin: "bottom",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
