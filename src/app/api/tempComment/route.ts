import { Configuration, OpenAIApi } from "openai-edge";
import { Message, OpenAIStream, StreamingTextResponse } from "ai";
import {
  chats,
  messages as _messages,
  responses as _responses,
  papers,
} from "@/lib/db/schema";
import { NextResponse } from "next/server";

export const runtime = "edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export async function POST(req: Request) {
  try {
    const { paperTitle, student_question, current_response, human_feedback } =
      await req.json();

    const content = `The AI assistant specilizes in assisting human instructors to improve current response to students' question regarding the academic paper named '${paperTitle}'. 
    Characteristics include scholarly expertise, analytical depth, and clear communication. 
    Professional and courteous, the agent is ready to provide insightful and concise responses. 

    START OF STUDENT QUESTION BLOCK
    ${student_question}
    END OF STUDENT QUESTION BLOCK

    START OF CURRENT RESPONSE BLOCK
    ${current_response}
    END OF  CURRENT RESPONSE BLOCK

    The AI assistant has to provide a updated response to the student's question based on the user's feedback below on the current response.
    AI assistant will ignore the sentiment contained in the context while forming updated responses.
    If the user's feedback is not descriptive, the AI assistant will ignore the user's feedback block and just repeat exactly the content in the current response block.
    The AI assistant will avoids saying anything that is not related to answering the student's question, such as expressing appreciation or apologizing.
    `;

    // const inputMessages = [prompt, ...messages];

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: content },
        { role: "user", content: human_feedback },
      ],
      stream: true,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
