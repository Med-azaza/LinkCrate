import { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import type { Profile, Link } from "@/types";
import { Button } from "./ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import platforms from "../utils/platforms.json";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as z from "zod/v4";
import { Input } from "@/components/ui/input";

type Props = {
  profile: Profile | null;
  links: Link[];
  refetchProfile: () => Promise<void>;
};

export default function ProfileContainer({
  profile,
  links,
  refetchProfile,
}: Props) {
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    profile?.avatar_url || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Validate file size (30MB limit)
      if (file.size > 30 * 1024 * 1024) {
        setError("File size must be less than 30MB");
        return;
      }

      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
    // Simple flat file structure - no folders
    const filePath = fileName;

    console.log("Uploading to path:", filePath);
    console.log("User ID:", user.id);

    const { data, error: uploadError } = await supabase.storage
      .from("profile-pics")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("profile-pics")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let avatarUrl = profile?.avatar_url || "";

      // Upload new avatar if selected
      if (avatarFile) {
        // Delete old avatar if exists
        if (profile?.avatar_url) {
          try {
            const oldFileName = profile.avatar_url.split("/").pop();
            if (oldFileName && oldFileName.startsWith("avatar-")) {
              await supabase.storage.from("profile-pics").remove([oldFileName]);
            }
          } catch (deleteError) {
            console.warn("Could not delete old avatar:", deleteError);
          }
        }

        avatarUrl = await uploadAvatar(avatarFile);
      }

      // Update profile in database
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Update failed: ${updateError.message}`);
      }

      setSuccess("Profile updated successfully!");
      refetchProfile();
      setAvatarFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  let skeletonLinks = null;

  if (links.length < 5) {
    skeletonLinks = new Array(5 - links.length).fill("");
  }

  function getIconByName(name: string): string | undefined {
    const item = platforms.find((item) => item.name === name);
    return item?.icon;
  }

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="flex items-center justify-center gap-4 flex-1 relative ">
      {error && (
        <Alert className="absolute bottom-10 left-10 w-100 bg-red-500">
          <FontAwesomeIcon icon="fa-circle-exclamation" />
          <AlertTitle>Something went wrong!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="absolute bottom-10 left-10 w-100 bg-green-500">
          <FontAwesomeIcon icon="=fa-circle-check" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      {loading && (
        <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center">
          loading...
        </div>
      )}
      <Card className="flex-2/6 h-full bg-white flex items-center justify-center">
        <div className="w-70 h-143 relative py-8 px-3">
          <div className="flex flex-col items-center z-2 absolute inset-y-10 inset-x-3 gap-4 px-4 overflow-auto">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gray-200 shrink-0"></div>
            )}
            {profile?.first_name ? (
              <span>
                {profile.first_name} {profile.last_name}
              </span>
            ) : (
              <div className="h-4 w-40 rounded-full bg-gray-200 shrink-0"></div>
            )}
            {profile?.email ? (
              <span className="text-xs text-gray-500">{profile.email}</span>
            ) : (
              <div className="h-2 w-20 rounded-full bg-gray-200 shrink-0"></div>
            )}
            {links &&
              links.map((link) => (
                <div
                  className="w-full py-1.5 px-3 rounded text-white flex items-center justify-between"
                  style={{ backgroundColor: link.color }}
                  key={link.id}
                >
                  <div>
                    {link.platform !== "Custom" ? (
                      <FontAwesomeIcon
                        icon={["fab", getIconByName(link.platform)]}
                      />
                    ) : (
                      <FontAwesomeIcon icon="fa-link" />
                    )}
                    <span className="text-white text-xs font-light ml-2">
                      {link.platform}
                    </span>
                  </div>
                  <FontAwesomeIcon className="text-xs" icon="fa-arrow-right" />
                </div>
              ))}
            {skeletonLinks?.map((item, index) => (
              <div
                key={index}
                className="w-full py-1.5 px-3 rounded bg-gray-200 h-8"
              ></div>
            ))}
          </div>
          <img
            className="absolute z-1 top-0 right-0"
            src="/phone-frame.svg"
            alt=""
          />
        </div>
      </Card>
      <form onSubmit={handleSubmit} className="flex-2/3 h-full">
        <Card className="flex-2/3 h-full bg-white px-6 flex">
          <h1 className="text-2xl">Profile Details</h1>
          <p className="text-gray-500">
            Add your details to create a personal touch to your profile.
          </p>
          <div className="flex-1 flex flex-col gap-2">
            <Card className="flex-1 bg-white flex items-center justify-around flex-row ">
              <p className="text-gray-500">Profile picture</p>
              <Card
                onClick={triggerFileInput}
                className="size-50 cursor-pointer flex items-center justify-center text-fuchsia-500"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <FontAwesomeIcon className="text-5xl" icon="fa-image" />
                    Upload Image
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </Card>
              <p className="text-gray-500">Image must be below 30MB</p>
            </Card>
            <Card className="flex-1 bg-white px-4 flex justify-center">
              <div className="flex items-center justify-between">
                <span>First name*</span>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-1/2"
                  type="text"
                  placeholder="e.g. John"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Last name*</span>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-1/2"
                  type="text"
                  placeholder="e.g. Doe"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Email</span>
                <Input
                  className="w-1/2"
                  type="email"
                  placeholder="e.g. email@example.com"
                />
              </div>
            </Card>
          </div>
          <div className="flex items-center justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="cursor-pointer px-10"
            >
              Save
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
