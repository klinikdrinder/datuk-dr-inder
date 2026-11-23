import * as migration_20261110_081251_initial from './20261110_081251_initial';
import * as migration_20261110_083028_blob_object_key from './20261110_083028_blob_object_key';
import * as migration_20261114_035339_hero_signature_banner from './20261114_035339_hero_signature_banner';
import * as migration_20261114_043536_instagram_user_id from './20261114_043536_instagram_user_id';
import * as migration_20261114_055308_instagram_profile_picture from './20261114_055308_instagram_profile_picture';
import * as migration_20261116_044831_expertise_card_photos from './20261116_044831_expertise_card_photos';
import * as migration_20261116_080331_hero_credential_cards from './20261116_080331_hero_credential_cards';
import * as migration_20261117_090000_journal_five_blogs from './20261117_090000_journal_five_blogs';
import * as migration_20261123_090000_event_details from './20261123_090000_event_details';

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
    name: '20261114_055308_instagram_profile_picture',
  },
  {
    up: migration_20261116_044831_expertise_card_photos.up,
    down: migration_20261116_044831_expertise_card_photos.down,
    name: '20261116_044831_expertise_card_photos',
  },
  {
    up: migration_20261116_080331_hero_credential_cards.up,
    down: migration_20261116_080331_hero_credential_cards.down,
    name: '20261116_080331_hero_credential_cards'
  },
  {
    up: migration_20261117_090000_journal_five_blogs.up,
    down: migration_20261117_090000_journal_five_blogs.down,
    name: '20261117_090000_journal_five_blogs',
  },
  {
    up: migration_20261123_090000_event_details.up,
    down: migration_20261123_090000_event_details.down,
    name: '20261123_090000_event_details',
  },
];
