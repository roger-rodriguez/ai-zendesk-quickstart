import { getTicket } from "@/libs/zd";
import { classify } from "@/libs/cohere";
import { jsonToText } from "@/utils";

export const predictComplexity = async (ticketId: number) => {
  const { ticket } = await getTicket(ticketId);
  const simplifiedTicket = ticketDataForComplexityPrediction(ticket);
  const data = jsonToText(simplifiedTicket);
  const modelId = "9edc304c-95f8-4437-bac6-520e19c2bcf5-ft"; // 006
  const result = await classify(data, modelId);
  return result;
};

export const ticketDataForComplexityPrediction = (ticket: any) => {
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

(async () => {
  await predictComplexity(194012);
})();
