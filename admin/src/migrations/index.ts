import * as migration_20261110_081251_initial from './20261110_081251_initial';
import * as migration_20261110_083028_blob_object_key from './20261110_083028_blob_object_key';
import * as migration_20261114_035339_hero_signature_banner from './20261114_035339_hero_signature_banner';

export const migrations = [
  {
    up: migration_20261110_081251_initial.up,
    down: migration_20261110_081251_initial.down,
    name: '20261110_081251_initial',
  },
  {
    up: migration_20261110_083028_blob_object_key.up,
    down: migration_20261110_083028_blob_object_key.down,
    name: '20261110_083028_blob_object_key',
  },
  {
    up: migration_20261114_035339_hero_signature_banner.up,
    down: migration_20261114_035339_hero_signature_banner.down,
    name: '20261114_035339_hero_signature_banner'
  },
];
