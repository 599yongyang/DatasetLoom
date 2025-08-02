import {OpenAI} from "./openai";
import {readFileSync} from "fs";

export class QwenOmniClient {

    private static encodeAudio = (audioPath: string) => {
        const audioFile = readFileSync(audioPath);
        return audioFile.toString('base64');
    };

    static async audio(audioPath: string, prompt: string) {
        const openai = new OpenAI(
            {
                apiKey: process.env.QWEN_OMNI_API_KEY,
                baseURL: process.env.QWEN_OMNI_API_URL
            }
        );


        const base64Audio = this.encodeAudio(audioPath)

        const completion = await openai.chat.completions.create({
            model: "qwen-omni-turbo",
            messages: [
                {
                    "role": "user",
                    "content": [{
                        "type": "input_audio",
                        "input_audio": {"data": `data:;base64,${base64Audio}`, "format": "mp3"},
                    },
                        {"type": "text", "text": prompt}]
                }],
            stream: true
        });

        let fullContent = '';
        for await (const chunk of completion) {
            if (chunk.choices && chunk.choices.length > 0) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    fullContent += content;
                }
            }
        }
        return fullContent;
    }

}
