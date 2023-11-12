## Introduction

PaperTalk is a tool created to demystify the complex terminology and concepts found in academic papers based on my personal needs while reading academic papers in the deep learning field. It combines LLM-supported explanations with the valuable feedback of human instructors, ensuring both immediate understanding and accurate, in-depth learning. I believe this product has strong extensibility and can be applied to other fields of knowledge without too much burden.

## Motivation

PaperTalk was created in response to a personal challenge I encountered as a self-taught beginner in deep learning. While reading seminal papers in the field, I often found it difficult to fully comprehend all the terminology and expressions used. This limited understanding prevented me from delving deeper into sub-fields and addressing the puzzles I encountered within these papers. To resolve this, I frequently Googled specific questions, like 'What is an attention head in the Transformer paper?' or asked ChatGPT, 'Are you familiar with the paper "Attention is All You Need"? Explain the attention head concept to me.' However, this approach made reading and comprehending papers time-consuming, and I often retained little information over time without accumulating answers to my confusions.

To address this issue, I envisioned a product that would streamline the process of resolving these puzzles. This tool would not only answer questions but also keep a record of the inquiries made about a specific paper. However, a significant drawback of large language models like GPT-4 and GPT-3.5 is their propensity for hallucination. Relying solely on such models to solve academic puzzles seemed inadequate. During development, I considered incorporating human instruction, allowing a human instructor to provide feedback on the model's outputs.

Why would a human instructor volunteer for this? To provide some context, the task of reading seminal deep learning papers is part of a deep learning course I am taking this fall semester. An incentive for the instructor to use this product is that it offers a way to provide asynchronous feedback to students' questions. Even if questions can't be answered immediately, the instructor can provide improved or corrected answers later. This dual approach of AI and human input is the foundation of PaperTalk's design and functionality.

## Future Works

Having seen the potential for individuals to accumulate knowledge by providing feedback to AI models, I am eager to delve deeper into finding ways to incentivize continuous human intelligence contributions, which could become a shortage especially as Large Language Models (LLMs) become more prevalent. To this end, I plan to leverage a distributed learning technique known as Federated Learning to explore its potential in achieving these goals. Updates will be added to my repository once completed.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## More Build Details

Coming up...

## Acknowledgments

[next13-ai-companion] by Antonio Erdeljac: My project utilized the existing UI structure shared by Antonio, including the sidebar and the navbar. The code can be found [here](https://github.com/AntonioErdeljac/next13-ai-companion).

[chatpdf-yt]: Special thanks to Elliott Chong, whose project [chatpdf-yt] provided significant inspiration for structuring my own work. Additionally, some code snippets, including AWS S3 functionality and parsing for Pinecone functionality, were greatly influenced by his codes. More details can be found [here](https://github.com/elliott-chong/chatpdf-yt).

## A Few More Words

This project is designed as a MVP to test my idea, and as such, factors like latency and database optimization were not primary considerations during its development. If you see any areas for improvement that could enhance the user experience, please feel free to submit a pull request and share your contribution.

# papertalk-well
