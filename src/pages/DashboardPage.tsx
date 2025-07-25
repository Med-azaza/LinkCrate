import { useAuth } from "../contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LinksContainer from "@/components/LinksContainer";
import ProfileContainer from "@/components/ProfileContainer";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile, Link } from "@/types";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import QRCode from "qrcode";

export default function DashboardPage() {
  const [tab, setTab] = useState<"links" | "profile">("links");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [linksLoading, setLinksLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [showQR, setShowQR] = useState<boolean>(false);

  // preview for mobile
  const [previewShow, setPreviewShow] = useState(false);

  const { user, loading, signOut } = useAuth();

  const generateQRCode = async (text: string): Promise<string> => {
    try {
      const qrDataUrl = await QRCode.toDataURL(text, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });
      return qrDataUrl;
    } catch (error) {
      console.error("Error generating QR code:", error);
      throw error;
    }
  };

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
        toast.error("User not signed in.");
      }
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/${profile?.code}`
      );
      setCopied(true);

      // Reset the "copied" state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy text: ");
      console.error(err);
      // Fallback for older browsers
      fallbackCopyTextToClipboard(`${window.location.origin}/${profile?.code}`);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      }
    } catch (err) {
      toast.error("Fallback: Oops, unable to copy");
      console.error(err);
    }

    document.body.removeChild(textArea);
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
          toast.error("User not signed in.");
        }
      } catch (err) {
        toast.error((err as Error).message);
      } finally {
        setLinksLoading(false);
      }
    };

    fetchProfile();
    fetchLinks();
  }, []);

  useEffect(() => {
    const handleGenerateQR = async () => {
      try {
        const qrDataUrl = await generateQRCode(
          `${window.location.origin}/${profile?.code}`
        );
        setQrCodeDataUrl(qrDataUrl);
        setShowQR(true);
      } catch (error) {
        console.error("Error generating QR code:", error);
        toast.error("Failed to generate QR code. Please try again.");
      }
    };
    handleGenerateQR();
  }, [profile]);

  return (
    <div className="p-3 h-screen flex flex-col gap-4 relative overflow-auto">
      <Card className="bg-white flex items-center justify-between flex-row px-2 sm:px-4 py-2 gap-2 sm:gap-6">
        <div className="flex items-center justify-center">
          <img src="logo-brand.png" alt="" height={60} width={60} />
          <h1 className="text-2xl font-semibold hidden md:block">LinkCrate</h1>
        </div>
        <div className="gap-2 sm:gap-4 flex">
          <Button
            onClick={() => setTab("links")}
            className={`cursor-pointer bg-white ${
              tab === "links" && "text-fuchsia-500"
            }`}
          >
            <FontAwesomeIcon icon={["fas", "link"]} />
            <span className="hidden sm:block">Links</span>
          </Button>
          <Button
            onClick={() => setTab("profile")}
            className={`cursor-pointer bg-white ${
              tab === "profile" && "text-fuchsia-500"
            }`}
          >
            <FontAwesomeIcon icon={["fas", "user"]} />
            <span className="hidden sm:block">Profile Details</span>
          </Button>
        </div>
        <div className="gap-2 sm:gap-4 flex">
          <Button
            onClick={() => setPreviewShow(!previewShow)}
            className={`lg:hidden ${!previewShow ? "bg-white" : ""}`}
          >
            <FontAwesomeIcon icon={["fas", "eye"]} />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="cursor-pointer">
                <span className="hidden sm:block">Share</span>
                <FontAwesomeIcon
                  className=" block sm:hidden"
                  icon={["fas", "share"]}
                />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <div className=" flex items-center justify-center flex-col gap-3">
                {showQR && qrCodeDataUrl && (
                  <div className="qr-image-container">
                    <img
                      src={qrCodeDataUrl}
                      alt="QR Code"
                      className="rounded-md border-2"
                    />
                  </div>
                )}
                <span>{`${window.location.origin}/${profile?.code}`}</span>{" "}
                <Button
                  className={`w-30 cursor-pointer ${
                    copied ? "bg-green-500" : ""
                  }`}
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <>
                      <FontAwesomeIcon icon={["fas", "check"]} /> Copied!
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={["fas", "copy"]} /> Copy
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button className="cursor-pointer bg-red-500" onClick={signOut}>
            <FontAwesomeIcon icon={["fas", "right-from-bracket"]} />
          </Button>
        </div>
      </Card>
      {tab === "links" && !linksLoading && (
        <LinksContainer
          profile={profile}
          links={links}
          setLinks={setLinks}
          previewShow={previewShow}
        />
      )}
      {tab === "profile" && !linksLoading && (
        <ProfileContainer
          profile={profile}
          refetchProfile={fetchProfile}
          links={links}
          previewShow={previewShow}
        />
      )}
    </div>
  );
}
