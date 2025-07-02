import { Card } from "./ui/card";
import type { Profile, Link } from "@/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import platforms from "../utils/platforms.json";
import type { IconName } from "@fortawesome/fontawesome-svg-core";

type Props = {
  profile: Profile | null;
  links: Link[];
};

export default function LivePreview({ profile, links }: Props) {
  let skeletonLinks = null;

  if (links.length < 5) {
    skeletonLinks = new Array(5 - links.length).fill("");
  }

  function getIconByName(name: string): IconName {
    const item = platforms.find((item) => item.name === name);
    return (item?.icon as IconName) || "";
  }

  return (
    <Card className="flex-2/6 h-full bg-white flex items-center justify-center">
      <div className="w-70 h-143 relative py-8 px-3">
        <div className="flex flex-col items-center z-2 absolute inset-y-10 inset-x-3 gap-4 px-4 overflow-auto">
          {profile?.avatar_url ? (
            <img
              className="size-20 rounded-full shrink-0 object-cover"
              src={profile.avatar_url}
            />
          ) : (
            <div className="size-20 rounded-full bg-gray-200 shrink-0"></div>
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
          {skeletonLinks?.map((item, index) => (
            <div
              key={item + index}
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
  );
}
