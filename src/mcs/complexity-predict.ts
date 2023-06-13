import {
  getTicket,
} from "@/libs/zd";
import {
  classify,
} from "@/libs/cohere";
import { jsonToText } from "@/utils";


export const predictComplexity = async (ticketId: number) => {
  const { ticket } = await getTicket(ticketId);
  const simplifiedTicket = ticketDataForComplexityPrediction(ticket);
  const data = jsonToText(simplifiedTicket);
  const modelId = "af126d99-e119-4f0c-9539-60d4e43d4c2a-ft";
  const result = await classify(data, modelId);
  return result;
}

export const ticketDataForComplexityPrediction = (
  ticket: any,
) => {

  const {
    subject,
    description = "",
    organization_id,
    ticket_form_id,
    custom_fields = [],
  } = ticket || {};

  const simplifiedTicket = {
    subject,
    organization_id,
    ticket_form_id,
    first_comment: (description || "")
      .replaceAll(/(\r\n|\n|\r)/gm, " ")
      .replaceAll(/(####|#|text\/plain|=|-|=>)/g, ""),
  };

  // console.dir(simplifiedTicket, { depth: null });

  return simplifiedTicket;
};

(async()=>{
  await predictComplexity(194012);
 })();