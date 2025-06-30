import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faKey,
  faEye,
  faEyeSlash,
  faUserPlus,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import * as z from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const signUpSchema = z
  .object({
    email: z.email("Please enter a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must be less than 100 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [success, setSuccess] = useState(false);

  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    setAuthError("");

    try {
      // Sign up user
      const { data: authData, error } = await signUp(data.email, data.password);

      if (error) {
        setAuthError(error.message);
      } else if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: authData.user.id,
            email: data.email,
          },
        ]);

        if (profileError) {
          setAuthError("Failed to create profile");
        } else {
          setSuccess(true);
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        }
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

  if (success) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <FontAwesomeIcon icon={faUserPlus} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Account Created!
            </h2>
            <p className="text-gray-600">
              You'll be redirected to your dashboard shortly.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen flex-col relative">
      <div className="flex items-center justify-center">
        <img src="logo-brand.png" alt="" height={120} width={120} />
        <h1 className="text-5xl font-semibold">LinkCrate</h1>
      </div>
      <Card className="bg-white p-8 min-w-120">
        <p className="font-bold text-xl">Create account</p>
        <span className="text-gray-500">
          Let's get your link hub live in seconds!
        </span>
        <form onSubmit={handleSubmit(onSubmit)}>
          {authError && (
            <Alert className="absolute bottom-10 right-10 w-100 bg-red-500">
              <FontAwesomeIcon icon={faCircleExclamation} />
              <AlertTitle>Something went wrong!</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

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

          <span className="text-xs text-gray-600">Create password</span>
          <div
            className={`border-2 rounded-md p-2 mb-4 flex items-center justify-start gap-2  ${
              errors.password ? "border-red-500" : "border-black"
            }`}
          >
            <FontAwesomeIcon icon={faKey} className="text-gray-400" />
            <input
              className="flex-1 outline-0"
              placeholder="At least 8 characters"
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

          <span className="text-xs text-gray-600">Confirm password</span>
          <div
            className={`border-2 rounded-md p-2 mb-4 flex items-center justify-start gap-2  ${
              errors.email ? "border-red-500" : "border-black"
            }`}
          >
            <FontAwesomeIcon icon={faKey} className="text-gray-400" />
            <input
              className="flex-1 outline-0"
              placeholder="At least 8 characters"
              type={showPassword ? "text" : "password"}
              {...register("confirmPassword")}
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
          <div className=" h-15">
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
            {errors.confirmPassword && (
              <p className="mb-1 text-xs text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer 
            "
          >
            {loading ? "loading..." : "Create new account"}
          </Button>
        </form>
        <p className="text-center w-full text-gray-500">
          Already have an account?{" "}
          <Link to="/login">
            {" "}
            <span className="text-fuchsia-500">Login</span>
          </Link>
        </p>
      </Card>
    </div>
  );
}
