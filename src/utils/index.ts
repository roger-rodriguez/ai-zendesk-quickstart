import fs from "fs/promises";

export const jsonToText = (json: any) => {
  let text = "";
  for (const key in json) {
    text += `${key}: ${json[key]}\n`;
  }
  return text;
};

export async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch (err) {
    return false;
  }
}

export function groupBy(array: any[], property: string) {
  return array.reduce((groups, item) => {
    const group = groups[item[property]] || [];
    group.push(item);
    groups[item[property]] = group;
    return groups;
  }, {});
}
