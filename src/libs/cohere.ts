const COHERE_API_KEY = process.env.COHERE_API_KEY;

export const classify = async (data: string, modelId: string) => {
  const options = {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "authorization": `Bearer ${COHERE_API_KEY} `,
    },
    body: JSON.stringify({
      model: modelId,
      inputs: [data],
    }),
  };

  const res = await fetch(`https://api.cohere.ai/v1/classify`, options);
  const json = await res.json();
  const prediction = json.classifications[0]?.prediction;
  const confidence =
    (json.classifications[0]?.confidence * 100).toFixed(2) + "%";
  const { input, labels, ...rest } = json?.classifications[0];
  const result = { modelId, prediction, confidence };
  console.dir(result, { depth: null });
  return result;
};
