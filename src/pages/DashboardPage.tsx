import { useAuth } from "../contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLink,
  faUser,
  faRightFromBracket,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import LinksContainer from "@/components/LinksContainer";
import ProfileContainer from "@/components/ProfileContainer";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile, Link } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DashboardPage() {
  const [tab, setTab] = useState<"links" | "profile">("links");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [links, setLinks] = useState<Link[]>([]);
  const [linksLoading, setLinksLoading] = useState<boolean>(false);

  const { user, loading, signOut } = useAuth();

  const fetchProfile = async () => {
    try {
      if (user && !loading) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } else {
        setError("User not signed in.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchLinks = async () => {
      setLinksLoading(true);
      try {
        if (user && !loading) {
          const { data, error } = await supabase
            .from("links")
            .select("*")
            .eq("user_id", user.id)
            .order("order_index", { ascending: true });

          if (error) throw error;
          setLinks(data);
        } else {
          setError("User not signed in.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLinksLoading(false);
      }
    };

    fetchProfile();
    fetchLinks();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="p-3 h-screen flex flex-col gap-4 relative overflow-hidden">
      {error && (
        <Alert className="absolute bottom-10 right-10 w-100 bg-red-500">
          <FontAwesomeIcon icon={faCircleExclamation} />
          <AlertTitle>Something went wrong!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card className="bg-white flex items-center justify-between flex-row px-4 py-2">
        <div className="flex items-center justify-center">
          <img src="logo-brand.png" alt="" height={60} width={60} />
          <h1 className="text-2xl font-semibold">LinkCrate</h1>
        </div>
        <div className="gap-4 flex">
          <Button
            onClick={() => setTab("links")}
            className="cursor-pointer bg-white"
          >
            <FontAwesomeIcon icon={faLink} />
            Links
          </Button>
          <Button
            onClick={() => setTab("profile")}
            className="cursor-pointer bg-white"
          >
            <FontAwesomeIcon icon={faUser} />
            Profile Details
          </Button>
        </div>
        <div className="gap-4 flex">
          <Button className="cursor-pointer">Preview</Button>
          <Button className="cursor-pointer bg-red-500" onClick={signOut}>
            <FontAwesomeIcon icon={faRightFromBracket} />
          </Button>
        </div>
      </Card>
      {tab === "links" && !linksLoading && (
        <LinksContainer profile={profile} links={links} setLinks={setLinks} />
      )}
      {tab === "profile" && !linksLoading && (
        <ProfileContainer
          profile={profile}
          refetchProfile={fetchProfile}
          links={links}
        />
      )}
    </div>
  );
}
