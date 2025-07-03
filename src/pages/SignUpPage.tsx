import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import * as z from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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

  const { signUp } = useAuth();
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

    try {
      // Sign up user
      const { data: authData, error } = await signUp(data.email, data.password);

      if (error) {
        toast.error(error.message);
      } else if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: authData.user.id,
            email: data.email,
            code: Math.random().toString(36).slice(2, 6).padStart(4, "0"),
          },
        ]);

        if (profileError) {
          toast.error("Failed to create profile");
        } else {
          toast.success("Account Created!");
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen flex-col relative px-3 sm:px-0">
      <div className="flex items-center justify-center">
        <img
          src="logo-brand.png"
          alt=""
          className="size-20 sm:size-25 md:size-30"
        />
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-semibold">
          LinkCrate
        </h1>
      </div>
      <Card className="bg-white p-8 w-full gap-2 sm:gap-4 md:gap-6 sm:w-120">
        <p className="font-bold text-xl">Create account</p>
        <span className="text-gray-500">
          Let's get your link hub live in seconds!
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

          <span className="text-xs text-gray-600">Create password</span>
          <div
            className={`border-2 rounded-md p-2 mb-4 flex items-center justify-start gap-2  ${
              errors.password ? "border-red-500" : "border-black"
            }`}
          >
            <FontAwesomeIcon icon={["fas", "key"]} className="text-gray-400" />
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

          <span className="text-xs text-gray-600">Confirm password</span>
          <div
            className={`border-2 rounded-md p-2 mb-4 flex items-center justify-start gap-2  ${
              errors.email ? "border-red-500" : "border-black"
            }`}
          >
            <FontAwesomeIcon icon={["fas", "key"]} className="text-gray-400" />
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
