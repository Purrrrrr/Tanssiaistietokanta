export default function(program) {
  let currentPart = {name: "", tracks: []}
;
  const parts = [];
  program.forEach(item => {
    if (item.type === 'HEADER') {
      if (currentPart) parts.push(currentPart);
      currentPart = {name: item.name, tracks: []}
    } else {
      currentPart.tracks.push(item);
    }
  });
  if (currentPart) parts.push(currentPart);

  return parts;
}
