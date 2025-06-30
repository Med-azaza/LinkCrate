import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center h-screen gap-10  flex-col">
      <img src="logo-brand.png" alt="" height={200} width={200} />
      <h1 className="text-6xl">Welcome to LinkCrate</h1>
      <div className="text-center max-w-150 ">
        <p className="text-xl mb-2 text-gray-700">
          Let’s get you sharing, one beautiful link at a time!
        </p>
        <p className="text-gray-500">
          Share all your important links in one place with a single, beautiful
          profile. Perfect for creators, professionals, and anyone who wants to
          connect smarter. No clutter, just your content, your way.
        </p>
      </div>
      <Button
        className=" px-30 py-6 text-xl cursor-pointer"
        onClick={() => navigate("signup")}
      >
        Get Started
      </Button>
    </div>
  );
}
