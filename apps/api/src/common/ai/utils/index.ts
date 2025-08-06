import {CoreAssistantMessage, CoreToolMessage, UIMessage} from "ai";

type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

export class MessageUtil {
    static getTrailingMessageId({messages}: { messages: Array<ResponseMessage> }): string | null {
        const trailingMessage = messages.at(-1);

        if (!trailingMessage) return null;

        return trailingMessage.id;
    }

    static getMostRecentUserMessage(messages: Array<UIMessage>) {
        const userMessages = messages.filter(message => message.role === 'user');
        return userMessages.at(-1);
    }


}
