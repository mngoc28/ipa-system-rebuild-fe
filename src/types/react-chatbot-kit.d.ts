import { ReactChatbotKitProps } from "@/dataHelper/chatbot.dataHelper";

declare module "react-chatbot-kit" {
  import * as React from "react";

  type ChatbotMessageOptions = Record<string, unknown>;

  export default class Chatbot extends React.Component<ReactChatbotKitProps> {}

  export function createChatBotMessage(message: string, options?: ChatbotMessageOptions): unknown;
  export function createClientMessage(message: string, options?: ChatbotMessageOptions): unknown;
  export function createCustomMessage(message: string, type: string, options?: ChatbotMessageOptions): unknown;
}
