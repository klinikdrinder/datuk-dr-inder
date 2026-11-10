import * as migration_20261110_081251_initial from './20261110_081251_initial';

export const migrations = [
  {
    up: migration_20261110_081251_initial.up,
    down: migration_20261110_081251_initial.down,
    name: '20261110_081251_initial'
  },
];
