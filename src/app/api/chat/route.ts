import { Configuration, OpenAIApi } from "openai-edge";
import { Message, OpenAIStream, StreamingTextResponse } from "ai";
import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import {
  chats,
  messages as _messages,
  responses as _responses,
  papers,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs";

export const runtime = "edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    const userName = `${user?.firstName} ${user?.lastName}`;
    const { messages, chatId } = await req.json();
    // const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    // if (_chats.length != 1) {
    //   return NextResponse.json({ error: "chat not found" }, { status: 404 });
    // }
    const _chats = await db
      .select()
      .from(chats)
      .rightJoin(papers, eq(chats.paperId, papers.id))
      .where(eq(chats.id, chatId));

    if (_chats.length != 1) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 });
    }

    const fileKey = _chats[0].papers.fileKey;
    const paperTitle = _chats[0].papers.paperTitle;
    const lastMessage = messages[messages.length - 1];
    const context = await getContext(lastMessage.content, fileKey);
    // console.log(context);
    // once it's over than 4096 tokens, they won't be able to collect the context any more

    const prompt = {
      role: "system",
      content: `The AI assistant specializes in academic papers, equipped to answer questions about a specific paper named '${paperTitle}' with precision and depth. 
      Characteristics include scholarly expertise, analytical depth, and clear communication. 
      Professional and courteous, the agent is ready to provide insightful and concise responses. 
      It has a comprehensive academic knowledge base, particularly valuing innovative research.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will ignore the sentiment contained in below messages while forming new answers.
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation, which are truncated directly from the paper iteself.
      AI assistant's ultimate goal is to provide the most accurate answer to the question, if CONTEXT BLOCK provides irrelevant information, AI assistant will ignore it.
      If the context does not provide the answer or sufficient context information to question , the AI assistant should answer the question based their own knowledge regarding the paper '${paperTitle}'.
      If the AI assistant does not have base knowledge about this paper, it will provide context from the paper to help users find the answer.
      If the question is beyond the scope of this paper '${paperTitle}', the AI assistant will answer it based on their own knowledge.
      AI assistant will not apologize for previous responses, but take previous messages information into account while forming new answers.
      AI assistant will not invent anything that is not drawn directly from the context, sticking to verified academic content.
      `,
    };

    const inputMessages = [prompt, ...messages];

    const isInputTooLong = (inputMessages: any[]) => {
      const messagesString = inputMessages
        .map((msg) => JSON.stringify(msg))
        .join(" ");
      const totalCharacters = messagesString.length;
      const averageTokenSize = 3;

      const estimatedTokens = Math.ceil(totalCharacters / averageTokenSize);
      console.log(estimatedTokens);
      return estimatedTokens > 3072; // to be safe
    };

    let response;
    if (isInputTooLong(inputMessages)) {
      // If input is too long, use a reduced set of messages
      const reducedInputMessages = [
        inputMessages[0],
        ...inputMessages.slice(-5),
      ];
      console.log(reducedInputMessages);
      response = await openai.createChatCompletion({
        model: "gpt-4",
        messages: reducedInputMessages,
        stream: true,
      });
    } else {
      console.log(inputMessages);
      // If input is not too long, use the full set of messages
      response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: inputMessages,
        stream: true,
      });
    }

    let userMessageId: number | undefined;
    let modelMessageId: number | undefined;
    const stream = OpenAIStream(response, {
      onStart: async () => {
        // save user message into db
        const insertResults = await db
          .insert(_messages)
          .values({
            chatId,
            content: lastMessage.content,
            role: "user",
          })
          .returning({ insertedId: _messages.id });
        // Check if at least one result is present
        if (insertResults.length === 0) {
          throw new Error("No insert result returned");
        }
        userMessageId = insertResults[0].insertedId;
      },
      onCompletion: async (completion) => {
        // save ai message into db
        const modelInsertResults = await db
          .insert(_messages)
          .values({
            chatId,
            content: completion,
            role: "assistant",
          })
          .returning({ insertedId: _messages.id });
        modelMessageId = modelInsertResults[0].insertedId;
      },
      onFinal: async (finalCompletion) => {
        // Once the final completion is received, link it to the user's message
        if (userMessageId === undefined) {
          throw new Error("User message ID not set");
        }
        await db.insert(_responses).values({
          messageId: userMessageId,
          feedbackMessageId: modelMessageId,
          content: finalCompletion, // Save the final completion associated with the user's message
          userName: userName,
        });
      },
    });
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
