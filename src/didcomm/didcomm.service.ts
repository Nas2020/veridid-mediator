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
            const unpackedMessageNew = await veramoAgent.handleMessage({ raw: packedMessage.message })
            console.log("unpackedMessageNew", unpackedMessageNew)
            const unpackedMessage = await veramoAgent.unpackDIDCommMessage(packedMessage);
            console.log("unpackedMessage", unpackedMessage)
            if (!unpackedMessage) {
                console.error("Failed to unpack message: ", packedMessage);
                return { error: "Error unpacking the message!" };
            }
            const data = unpackedMessage?.message?.attachments[0]?.data?.json
            const packedMessageToForward = {
                message: `${JSON.stringify(data)}`
            }

            // const packedMessageToForward = {
            //     message: `${JSON.stringify(unpackedMessageNew.raw)}`
            // }
            //console.log("unpackedMessageNew.metaData", unpackedMessageNew.raw)
            console.log("packedMessageToForward", packedMessageToForward)
            // Forward the message
            const msgId = v4()
            const response = await veramoAgent.sendDIDCommMessage({
                messageId: msgId,
                packedMessage: packedMessageToForward,
                recipientDidUrl: unpackedMessage.message.body.next,
                // recipientDidUrl: unpackedMessageNew.data.next
            });
            console.log("Message Forwarded", response)
            return;
        } catch (error) {
            console.error("Error processing message: ", error);
            return { error: "An error occurred while processing the message." };
        }
    }

}
