import { useState, useRef } from "react";
import { Card } from "./ui/card";
import type { Profile, Link } from "@/types";
import { Button } from "./ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import LivePreview from "./LivePreview";
import { toast } from "sonner";

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
  const [email, setEmail] = useState(profile?.email || "");
  const [code, setCode] = useState(profile?.code || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    profile?.avatar_url || ""
  );
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (30MB limit)
      if (file.size > 30 * 1024 * 1024) {
        toast.error("File size must be less than 30MB");
        return;
      }

      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
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

    const { error: uploadError } = await supabase.storage
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
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          email,
          code,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Update failed: ${updateError.message}`);
      }

      toast.success("Profile updated successfully!");
      refetchProfile();
      setAvatarFile(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center justify-center gap-4 flex-1 relative ">
      {loading && (
        <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center">
          loading...
        </div>
      )}
      <LivePreview profile={profile} links={links} />
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
                className="size-50 p-0 cursor-pointer flex items-center justify-center text-fuchsia-500 relative "
              >
                {avatarPreview ? (
                  <>
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="size-full object-cover"
                    />
                    <div className="absolute text-white bg-black/30 inset-0 flex items-center justify-center flex-col gap-4">
                      <FontAwesomeIcon
                        className="text-5xl"
                        icon={["fas", "image"]}
                      />
                      <span>Change Image</span>
                    </div>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon
                      className="text-5xl"
                      icon={["fas", "image"]}
                    />
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-1/2"
                  type="email"
                  placeholder="e.g. email@example.com"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Code</span>
                <div className="w-1/2 flex items-center justify-end gap-2">
                  <span className="text-gray-400">link-crate.com/</span>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    type="text"
                    maxLength={20}
                    minLength={4}
                    className="flex-1"
                  />
                </div>
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
