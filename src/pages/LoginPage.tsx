import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faKey,
  faEye,
  faEyeSlash,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const { signIn, user } = useAuth();
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
    setAuthError("");

    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        setAuthError(error.message);
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setAuthError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authError) {
      const timer = setTimeout(() => {
        setAuthError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [authError]);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center h-screen flex-col relative">
      {authError && (
        <Alert className="absolute bottom-10 right-10 w-100 bg-red-500">
          <FontAwesomeIcon icon={faCircleExclamation} />
          <AlertTitle>Something went wrong!</AlertTitle>
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}
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
            <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
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
            <FontAwesomeIcon icon={faKey} className="text-gray-400" />
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
                <FontAwesomeIcon icon={faEye} className="text-gray-400" />
              ) : (
                <FontAwesomeIcon icon={faEyeSlash} className="text-gray-400" />
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
