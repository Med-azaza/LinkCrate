import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);

    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        toast.error(error.message);
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen flex-col relative">
      <div className="flex items-center justify-center">
        <img src="logo-brand.png" alt="" height={120} width={120} />
        <h1 className="text-5xl font-semibold">LinkCrate</h1>
      </div>

      <Card className="bg-white p-8 min-w-120">
        <p className="font-bold text-xl">Login</p>
        <span className="text-gray-500">
          Welcome back! Just enter your details to continue.
        </span>
        <form onSubmit={handleSubmit(onSubmit)}>
          <span className="text-xs text-gray-600">Email address</span>
          <div
            className={`border-2 rounded-md p-2 mb-4 flex items-center justify-start gap-2  ${
              errors.email ? "border-red-500" : "border-black"
            }`}
          >
            <FontAwesomeIcon
              icon={["fas", "envelope"]}
              className="text-gray-400"
            />
            <input
              type="email"
              className="flex-1 outline-0"
              placeholder="e.g. john@email.com"
              {...register("email")}
            />
          </div>

          <span className="text-xs text-gray-600">Password</span>
          <div
            className={`border-2 rounded-md p-2 mb-4 flex items-center justify-start gap-2  ${
              errors.password ? "border-red-500" : "border-black"
            }`}
          >
            <FontAwesomeIcon icon={["fas", "key"]} className="text-gray-400" />
            <input
              className="flex-1 outline-0"
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowPassword(!showPassword);
              }}
              className="cursor-pointer"
            >
              {!showPassword ? (
                <FontAwesomeIcon
                  icon={["fas", "eye"]}
                  className="text-gray-400"
                />
              ) : (
                <FontAwesomeIcon
                  icon={["fas", "eye-slash"]}
                  className="text-gray-400"
                />
              )}
            </button>
          </div>
          <div className=" h-5">
            {errors.email && (
              <p className="mb-1 text-xs text-red-400">
                {errors.email.message}
              </p>
            )}
            {errors.password && (
              <p className="mb-1 text-xs text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer 
            "
          >
            {loading ? "loading..." : "Login"}
          </Button>
        </form>
        <p className="text-center w-full text-gray-500">
          Don't have an account?{" "}
          <Link to="/signup">
            {" "}
            <span className="text-fuchsia-500">Create account</span>
          </Link>
        </p>
      </Card>
    </div>
  );
}
