import * as migration_20260825_105612_init_cms_schema from "./20260825_105612_init_cms_schema";

export const migrations = [
  {
    up: migration_20260825_105612_init_cms_schema.up,
    down: migration_20260825_105612_init_cms_schema.down,
    name: "20260825_105612_init_cms_schema",
  },
];
