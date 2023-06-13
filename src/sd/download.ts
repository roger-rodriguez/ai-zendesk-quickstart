import path from "path";
import fs from "fs/promises";
import {
  searchTicketsByGroup,
} from "@/libs/zd";



export const downloadZDTickets = async () => {

  const { results } = await searchTicketsByGroup({
    group: "Solutions Development",
    // solved: "solved>2023-01-01 solved<2023-01-31",
    // solved: "solved>2023-02-01 solved<2023-02-28",
    // solved: "solved>2023-03-01 solved<2023-03-31",
    // solved: "solved>2023-04-01 solved<2023-04-30",
    // solved: "solved>2023-05-01 solved<2023-05-31",
  });

  if(!results.length){
    console.log("No results found");
    return;
  }

  const outputDir = path.join(__dirname, "data", "tickets");
  await storeDatasetToFileSystem(results, resultMapper, outputDir);

}


const storeDatasetToFileSystem = async (dataset: any[], datasetMapper: any, outputDir: string) => {
  for await (const data of dataset) {
    try {
      const { fileDir, fileName, fileContent } = await datasetMapper(data);

      if(!fileDir || !fileName || !fileContent){
        continue;
      }

      const directoryPath = path.dirname(fileDir);
      const fullFilePath = path.join(outputDir, fileDir, fileName);

      await fs.mkdir(directoryPath, { recursive: true });
      await fs.writeFile(fullFilePath, fileContent, "utf8");
    } catch (error) {
      console.error(error);
    }
  }
}

const resultMapper = async (result: any) => {
  // console.dir(result, { depth: null });
  const { created_at } = result || {};

  if(!created_at){
    return {};
  }

  const date = new Date(created_at);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  return {
    fileDir: `${year}/${month}`,
    fileName: `${result.id}.json`,
    fileContent: JSON.stringify(result),
  };
}


(async()=>{
  await downloadZDTickets();
 })();