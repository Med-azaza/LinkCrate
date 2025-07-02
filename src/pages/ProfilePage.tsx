import { Card } from "@/components/ui/card";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { Link as linkType, Profile } from "@/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import platforms from "../utils/platforms.json";
import type { IconName } from "@fortawesome/fontawesome-svg-core";

export default function ProfilePage() {
  const { code } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<linkType[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileAndLinks = async () => {
      try {
        setLoading(true);

        // get the profile by code
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("code", code)
          .single();

        if (profileError) {
          toast.error("Profile not found");
          return;
        }

        setProfile(profileData);

        // get all links for this profile using the profile's user_id
        const { data: linksData, error: linksError } = await supabase
          .from("links")
          .select("*")
          .eq("user_id", profileData.id)
          .order("order_index", { ascending: true });

        if (linksError) {
          toast.error("Error fetching links");
          console.error(linksError);
        } else {
          setLinks(linksData || []);
        }
      } catch (err) {
        toast.error("An error occurred while fetching data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchProfileAndLinks();
    }
  }, [code]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  if (!profile)
    return (
      <div className="h-screen flex items-center justify-center flex-col">
        <Link to="/" className="flex items-center justify-center">
          <img src="logo-brand.png" alt="" height={120} width={120} />
          <h1 className="text-5xl font-semibold">LinkCrate</h1>
        </Link>
        <Card className="p-10 bg-white">
          <FontAwesomeIcon
            icon={["fas", "triangle-exclamation"]}
            className="text-red-400 text-5xl"
          />
          <p className="text-center text-gray-500">
            Sorry, the Profile you're looking for is not found
          </p>
          <p className="text-center text-2xl">Create your own LinkCrate NOW!</p>
          <Button onClick={() => navigate("/")} className="cursor-pointer">
            Get Started
          </Button>
        </Card>
      </div>
    );

  function getIconByName(name: string): IconName {
    const item = platforms.find((item) => item.name === name);
    return (item?.icon as IconName) || "";
  }

  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <Link to="/" className="flex items-center justify-center">
        <img src="logo-brand.png" alt="" height={120} width={120} />
        <h1 className="text-5xl font-semibold">LinkCrate</h1>
      </Link>
      <Card className="px-8 bg-white min-w-90 h-3/4 flex items-center justify-start overflow-auto">
        {profile.avatar_url ? (
          <img
            className="size-30 object-cover rounded-full "
            src={profile.avatar_url}
          />
        ) : (
          <div className="size-30 rounded-full bg-gray-200 shrink-0"></div>
        )}
        <div className="flex flex-col gap-1 items-center justify-center">
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
        </div>

        {links &&
          links.map((link) => (
            <div
              className="w-full py-2 px-3 rounded text-white flex items-center justify-between cursor-pointer"
              style={{ backgroundColor: link.color }}
              key={link.id}
              onClick={() =>
                window.open(link.url, "_blank", "noopener,noreferrer")
              }
            >
              <div>
                {link.platform !== "Custom" ? (
                  <FontAwesomeIcon
                    icon={["fab", getIconByName(link.platform)]}
                  />
                ) : (
                  <FontAwesomeIcon icon={["fas", "link"]} />
                )}
                <span className="text-white text-xs font-light ml-2">
                  {link.platform}
                </span>
              </div>
              <FontAwesomeIcon
                className="text-xs"
                icon={["fas", "arrow-right"]}
              />
            </div>
          ))}
      </Card>
    </div>
  );
}
