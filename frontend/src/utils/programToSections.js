export default function(program) {
  let currentPart = null;
  const parts = [];
  program.forEach(item => {
    if (item.type === 'DANCE') {
      currentPart.tracks.push(item);
    } else {
      if (currentPart) parts.push(currentPart);
      currentPart = {name: item.name, tracks: []}
    }
  });
  if (currentPart) parts.push(currentPart);

  return parts;
}
