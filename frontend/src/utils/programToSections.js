export default function programToSections(program) {
  let currentPart = null;

  const parts = [];
  program.forEach(item => {
    if (item.type === 'HEADER') {
      if (currentPart) parts.push(currentPart);
      currentPart = {...item, tracks: []}
    } else {
      if (!currentPart) {
        currentPart = {type: 'HEADER', name: "", tracks: [], isIntroHeader: true};
      }
      currentPart.tracks.push(item);
    }
  });
  if (currentPart) parts.push(currentPart);

  return parts;
}
