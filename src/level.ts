const map =
'abbbbbbc\n' + 
'deeeeeed\n' + 
'deeeeeed\n' + 
'deeeeeefbbbbbbbbbbbbc\n' + 
'deeeeeeeeeeeeeeeeeeed\n' + 
'deeeeeeeeeeeeeeeeeeed\n' + 
'deeeeeeeeeeeeeeeeeeed\n' + 
'fbbbbbbbbbbbbbbbbbbbg\n';

const tiles = {
  a: { m: 'corner' },
  b: { m: 'side', rotate: 90 },
  c: { m: 'corner', rotate: 90 },
  d: { m: 'side' },
  e: { m: 'floor' },
  f: { m: 'corner', rotate: -90 },
  g: { m: 'corner', rotate: 180 },
};

export { map, tiles };