import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import type { Profile, Link } from "@/types";
import { Button } from "./ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faCircleExclamation,
  type IconName,
} from "@fortawesome/free-solid-svg-icons";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import * as z from "zod/v4";
import LivePreview from "./LivePreview";
import { toast } from "sonner";

type EditableLink = Link & {
  isNew: boolean;
};
type Props = {
  profile: Profile | null;
  links: Link[];
  setLinks: React.Dispatch<React.SetStateAction<Link[]>>;
  previewShow: boolean;
};

const linkSchema = z.object({
  id: z.string(), // or z.string() if IDs are strings
  platform: z.string().min(1, "Platform is required"),
  url: z.string().refine((val) => {
    try {
      // First check if it's a valid URL
      const url = new URL(val);

      // Then check if hostname has a "." and at least one letter after it
      const hostname = url.hostname;
      const dotIndex = hostname.lastIndexOf(".");

      if (dotIndex === -1) return false; // No dot found
      if (dotIndex === hostname.length - 1) return false; // Dot is at the end

      const afterDot = hostname.substring(dotIndex + 1);
      return /[a-zA-Z]/.test(afterDot); // At least one letter after dot
    } catch {
      return false;
    }
  }, "Invalid URL format"),
});

const linksSchema = z.array(linkSchema);

export default function LinksContainer({
  profile,
  links,
  setLinks,
  previewShow,
}: Props) {
  const [editableLinks, setEditableLinks] = useState<EditableLink[]>(
    links.map((link) => ({ ...link, isNew: false }))
  );
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  const colorMap = new Map(
    platforms.map((p) => [p.name.toLowerCase(), p.color])
  );

  function getColorByName(name: string): string {
    return colorMap.get(name.toLowerCase()) ?? "#ff0000";
  }

  const handlePlatformChange = (linkId: string, newPlatform: string) => {
    setEditableLinks((prevLinks) =>
      prevLinks.map((link) =>
        link.id === linkId
          ? {
              ...link,
              platform: newPlatform,
              color: getColorByName(newPlatform),
            }
          : link
      )
    );
  };

  const handleUrlChange = (linkId: string, newUrl: string) => {
    setEditableLinks((prevLinks) =>
      prevLinks.map((link) =>
        link.id === linkId ? { ...link, url: newUrl } : link
      )
    );
  };

  const handleAddLink = () => {
    const id = uuidv4();
    setEditableLinks([
      ...editableLinks,
      {
        id: id,
        url: "",
        platform: "",
        order_index: editableLinks.length + 1,
        isNew: true,
      },
    ]);
  };

  const handleRemoveLink = (id) => {
    setEditableLinks(
      editableLinks
        .filter((link) => link.id !== id)
        .map((link, index) => ({ ...link, order_index: index + 1 }))
    );
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      if (user) {
        const validLinks = editableLinks.map((link) => ({
          ...link,
          url: link.url.startsWith("http") ? link.url : `https://${link.url}`,
        }));
        setEditableLinks(validLinks);
        await linksSchema.parse(validLinks);

        const newLinks = editableLinks.filter((link) => link.isNew);

        const updatedLinks = editableLinks.filter(
          (link) =>
            !link.isNew &&
            links.some(
              (orig) =>
                orig.id === link.id &&
                (orig.url !== link.url ||
                  orig.platform !== link.platform ||
                  orig.order_index !== link.order_index)
            )
        );
        const removedLinks = links.filter(
          (orig) => !editableLinks.some((link) => link.id === orig.id)
        );

        // Perform Supabase operations
        if (newLinks.length > 0) {
          await supabase.from("links").insert(
            newLinks.map((link) => ({
              id: link.id,
              user_id: user.id,
              url: link.url,
              platform: link.platform,
              order_index: link.order_index,
              color: link.color,
            }))
          );
        }

        if (updatedLinks.length > 0) {
          await Promise.all(
            updatedLinks.map((link) =>
              supabase
                .from("links")
                .update({
                  url: link.url,
                  platform: link.platform,
                  order_index: link.order_index,
                })
                .eq("id", link.id)
            )
          );
        }

        if (removedLinks.length > 0) {
          await Promise.all(
            removedLinks.map((link) =>
              supabase.from("links").delete().eq("id", link.id)
            )
          );
        }

        // Update originalLinks to match editableLinks
        setLinks([...editableLinks]);
      }
      toast.success("Links updated successfully!");
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error("invalid links");
      } else {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 flex-1 relative ">
      {loading && (
        <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center">
          loading...
        </div>
      )}
      <LivePreview show={previewShow} profile={profile} links={links} />

      <Card
        className={`flex-2/3 h-full bg-white px-6 ${
          previewShow ? "hidden" : ""
        } lg:flex`}
      >
        <h1 className="text-2xl">Customize your links</h1>
        <p className="text-gray-500">
          Add/edit/remove links below and then share all your profiles with the
          world!
        </p>
        <Button onClick={handleAddLink} className="cursor-pointer bg-white">
          <FontAwesomeIcon icon={faPlus} /> Add new link
        </Button>
        <ScrollArea className="flex-1 basis-0 border-b border-gray-300">
          {editableLinks.map((link) => (
            <div className="bg-gray-100 rounded-md p-4 mb-3" key={link.id}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-gray-600">
                  Link #{link.order_index}
                </p>
                <button
                  onClick={() => handleRemoveLink(link.id)}
                  className="font-light text-gray-500 cursor-pointer"
                >
                  Remove
                </button>
              </div>
              <span className="text-sm">Platform</span>
              <Select
                value={link.platform}
                onValueChange={(value) => handlePlatformChange(link.id, value)}
              >
                <SelectTrigger
                  className="mb-3 text-white"
                  style={{ backgroundColor: link.color }}
                >
                  <SelectValue placeholder="Choose a platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform.name} value={platform.name}>
                      <>
                        {platform.name !== "Custom" ? (
                          <FontAwesomeIcon
                            icon={["fab", platform.icon as IconName]}
                          />
                        ) : (
                          <FontAwesomeIcon icon={["fas", "link"]} />
                        )}

                        {platform.name}
                      </>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm">Link</span>
              <div className="border-2 rounded-md p-2 flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={["fas", "link"]} />
                <input
                  type="url"
                  placeholder="e.g. https://www.linkedin.com/johndoe"
                  className="flex-1 outline-0 "
                  value={link.url}
                  onChange={(e) => handleUrlChange(link.id, e.target.value)}
                />
              </div>
            </div>
          ))}
        </ScrollArea>
        <div className="flex items-center justify-end">
          <Button onClick={handleSave} className="cursor-pointer px-10">
            Save
          </Button>
        </div>
      </Card>
    </div>
  );
}
