import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen gap-5 md:gap-10 px-3 md:px-0  flex-col">
      <img src="logo-brand.png" alt="" className="size-30 md:size-50 " />
      <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl">
        Welcome to LinkCrate
      </h1>
      <div className="text-center max-w-150 ">
        <p className=" text-md  lg:text-xl mb-2 text-gray-700">
          Let’s get you sharing, one beautiful link at a time!
        </p>
        <p className="lg:text-md text-sm text-gray-500">
          Share all your important links in one place with a single, beautiful
          profile. Perfect for creators, professionals, and anyone who wants to
          connect smarter. No clutter, just your content, your way.
        </p>
      </div>
      <Button
        className="px-15 md:px-30 py-6 text-xl cursor-pointer"
        onClick={() => navigate("signup")}
      >
        Get Started
      </Button>
    </div>
  );
}
