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
  const classification = json?.classifications[0];
  const prediction = classification?.prediction;
  const confidence = (classification?.confidence * 100).toFixed(2) + "%";
  const result = { modelId, prediction, confidence };
  return result;
};
