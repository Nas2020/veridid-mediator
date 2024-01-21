/* eslint-disable prettier/prettier */

// didcomm.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { VeramoAgentService } from './didcomm.service.js';
import {ApiExcludeEndpoint } from '@nestjs/swagger';


@Controller('didcomm')
export class DidCommController {
    constructor(private readonly veramoAgentService: VeramoAgentService) { }

    @Post('/message')
    @ApiExcludeEndpoint() // Use ApiExclude decorator to exclude this endpoint
    async handleIncomingDIDCommMessage(@Body() body: string): Promise<any> {
        const packedMessage = { "message": body }
        return this.veramoAgentService.handleIncomingDIDCommMessageAsMediator(packedMessage);
    }

}
