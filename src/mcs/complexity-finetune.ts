import path from "path";
import fs from "fs/promises";
import { createReadStream } from "fs";
import { glob } from "glob";
import csv from "csv-parser";
import { createObjectCsvWriter, createObjectCsvStringifier } from "csv-writer";
import { jsonToText, fileExists, groupBy } from "@/utils";



const DATA_FOLDER = path.join(__dirname, "data");

export const main = async () => {
  const dataDir = path.join(DATA_FOLDER, "tickets");
  const complexityDir = path.join(DATA_FOLDER, "complexity-finetune");

  const fullFilePath = path.join(complexityDir, `full.csv`);
  const trainingFilePath = path.join(complexityDir, "training.csv");
  const validationFilePath = path.join(complexityDir, "validation.csv");
  const fullFileExists = await fileExists(fullFilePath);

  if(!fullFileExists){
    console.log({msg: "Creating full csv dataset"});
    const dataset = await readDatasetFromFileSystem(dataDir, resultMapper);
    await createFullCSVDataset(fullFilePath, dataset);
  }

  console.log({msg: "full csv dataset already exists"});

  await createFinetuneDataset({
    fullFilePath,
    trainingFilePath,
    validationFilePath
  });
  
}


const readDatasetFromFileSystem = async (dataDir: string, datasetMapper: any, ) => {

  const files = await glob(`${dataDir}/**/*.json`);

  console.log({total_files: files.length});

  let i = 0;

  let dataset: any[] = [];

  for await (const file of files) {
    // if(i == 0){
      const data = await fs.readFile(file, "utf8");
      const json = JSON.parse(data);
      const item = await datasetMapper(json);
      dataset.push(item);
    // }
    // i++;
  }

  console.log({dataset_records: dataset.length});

  return dataset;
}

const resultMapper = async (ticket: any) => {
  const { 
    subject, organization_id,
    ticket_form_id, description, custom_fields
  } = ticket;

  // console.dir(ticket, { depth: null });

  const complexity = custom_fields.filter((field: any) => {
    return field.id === 37109447;
  });
  
  const relevantData = {
    subject,
    organization_id,
    ticket_form_id,
    complexity: complexity.length ? complexity[0].value : null,
    first_comment: (description || "")
      .replaceAll(/(\r\n|\n|\r)/gm, " ")
      .replaceAll(/(####|#|text\/plain|=|-|=>)/g, ""),
  }

  return relevantData;
}

const createFullCSVDataset = async (path: string, dataset: any[]) => {

  const records = [];
  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: "examples", title: "examples" },
      { id: "labels", title: "labels" },
    ],
  });

  for await (const data of dataset) {
    let examples = jsonToText(data);
    let labels = data?.complexity;
    if(!labels){
      continue;
    }
    records.push({
      examples,
      labels,
    });
  }

  let header = csvStringifier.getHeaderString();
  let csvData = csvStringifier.stringifyRecords(records);
  let csvString = header + csvData;

  await fs.appendFile(path, csvString);
};

const createFinetuneDataset = async ({
  fullFilePath,
  trainingFilePath,
  validationFilePath
}: any) => {
  const lines = [];
  const parser = createReadStream(fullFilePath).pipe(csv());

  for await (const line of parser) {
    lines.push(line);
  }

  // ensure training and validation sets have equal distribution of data by "labels" column
  const groups = groupBy(lines, "labels");

  const firstHalf = [];
  const secondHalf = [];

  for (const type in groups) {
    const group = groups[type];
    // const splitPointHalf = Math.ceil(group.length / 2);
    const splitPoint = Math.floor(group.length * 0.8); // Calculate the 80% point
    firstHalf.push(...group.slice(0, splitPoint));
    secondHalf.push(...group.slice(splitPoint));
  }

  const header = Object.keys(firstHalf[0]);

  const trainingFileWriter = createObjectCsvWriter({
    path: trainingFilePath,
    header: header.map((id) => ({ id, title: id })),
  });

  const validationFileWriter = createObjectCsvWriter({
    path: validationFilePath,
    header: header.map((id) => ({ id, title: id })),
  });

  await trainingFileWriter.writeRecords(firstHalf);
  await validationFileWriter.writeRecords(secondHalf);

  console.log({msg: "finetune csv's created"});

}



(async()=>{
 await main();
})();