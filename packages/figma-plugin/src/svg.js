/**
 * Het kleuren van uit SVG opgebouwde nodes.
 *
 * In de browser erven iconen hun kleur van `currentColor`, maar Figma kent dat
 * begrip niet: createNodeFromSvg maakt er zwart van. De bedoelde kleur wordt
 * daarom over de vectoren heen gezet, en alleen daar waar de SVG daadwerkelijk
 * een vulling of een lijn had. Zo blijft het verschil tussen een gevuld en een
 * lijn-icoon intact.
 */

/**
 * Kleurt `nodes` en al hun kinderen.
 *
 * @param {SceneNode[]} nodes de vectoren zelf, niet het frame eromheen
 * @param {Paint[]} paints
 */
export function recolorVectors(nodes, paints) {
  if (!paints || !paints.length) return;

  const visit = (current) => {
    if (Array.isArray(current.fills) && current.fills.length) {
      current.fills = paints;
    }
    if (Array.isArray(current.strokes) && current.strokes.length) {
      current.strokes = paints;
    }
    for (const child of current.children ?? []) visit(child);
  };

  for (const node of nodes) visit(node);
}
