import type { Block } from "payload";

export const videoEmbed: Block = {
  slug: "videoEmbed",
  labels: {
    singular: "Video embed",
    plural: "Video embeds",
  },
  admin: {
    group: "Blocks",
  },
  fields: [
    {
      name: "url",
      type: "text",
      label: "URL",
      required: true,
      validate: (value: string | null | undefined) => {
        if (!value) {
          return true;
        }
        try {
          const parsed = new URL(value);
          if (parsed.protocol !== "https:") {
            return "URL must use HTTPS.";
          }
          return true;
        } catch {
          return "Enter a valid HTTPS URL.";
        }
      },
    },
    {
      name: "poster",
      type: "upload",
      label: "Poster image",
      relationTo: "media",
      admin: {
        description:
          "Shown before playback. Alternative text is inherited from the selected media record.",
      },
    },
  ],
};
