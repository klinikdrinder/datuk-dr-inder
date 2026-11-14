import * as migration_20261110_081251_initial from './20261110_081251_initial';
import * as migration_20261110_083028_blob_object_key from './20261110_083028_blob_object_key';
import * as migration_20261114_035339_hero_signature_banner from './20261114_035339_hero_signature_banner';
import * as migration_20261114_043536_instagram_user_id from './20261114_043536_instagram_user_id';
import * as migration_20261114_055308_instagram_profile_picture from './20261114_055308_instagram_profile_picture';

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
    name: '20261114_035339_hero_signature_banner',
  },
  {
    up: migration_20261114_043536_instagram_user_id.up,
    down: migration_20261114_043536_instagram_user_id.down,
    name: '20261114_043536_instagram_user_id',
  },
  {
    up: migration_20261114_055308_instagram_profile_picture.up,
    down: migration_20261114_055308_instagram_profile_picture.down,
    name: '20261114_055308_instagram_profile_picture'
  },
];
