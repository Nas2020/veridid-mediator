/* eslint-disable prettier/prettier */
// file: didcomm.service.ts
// location: src/didcomm
import { Injectable } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { v4 } from 'uuid'


@Injectable()
export class VeramoAgentService {

    async handleIncomingDIDCommMessageAsMediator(packedMessage: any): Promise<{ text?: string, error?: string }> {

        try {
            const app = await NestFactory.create(AppModule);
            const veramoAgent = app.get('VERAMO_AGENT');
            const unpackedMessage = await veramoAgent.unpackDIDCommMessage(packedMessage);
            if (!unpackedMessage) {
                console.error("Failed to unpack message: ", packedMessage);
                return { error: "Error unpacking the message!" };
            }
            const data = unpackedMessage?.message?.attachments[0]?.data?.json
            const packedMessageToForward = {
                message: `${JSON.stringify(data)}`
            }
            // Forward the message
            const msgId = v4()
            const response = await veramoAgent.sendDIDCommMessage({
                messageId: msgId,
                packedMessage: packedMessageToForward,
                recipientDidUrl: unpackedMessage.message.body.next,
            });
            console.log("Message Forwarded", response)
            return;
        } catch (error) {
            console.error("Error processing message: ", error);
            return { error: "An error occurred while processing the message." };
        }
    }

}
