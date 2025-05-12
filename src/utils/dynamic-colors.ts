import materialDynamicColors from "material-dynamic-colors";

export async function generateThemes(imageSource: File) {
  return await materialDynamicColors(imageSource);
}
