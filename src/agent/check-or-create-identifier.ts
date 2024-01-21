/* eslint-disable prettier/prettier */
// file name : check-or-create-identifier.ts  
//location: src/agent
import fs from 'fs/promises';

export async function checkOrCreateDID(agent, alias, alias_peer, alias_key, agent_endpoint) {
    try {
        // Attempt to find existing DIDs with the given alias
        const existingIdentities = await agent.didManagerFind();
        let didWebCount = 0, didPeerCount = 0, didKeyCount = 0;



        // Count the types of existing DIDs
        existingIdentities.forEach((identity) => {
            if (identity.did.startsWith('did:web')) {
                didWebCount++;
            } else if (identity.did.startsWith('did:peer')) {
                didPeerCount++;
            } else if (identity.did.startsWith('did:key')) {
                didKeyCount++;
            }
        });

        // Create DIDs as necessary
        if (didWebCount === 0) {
            await createDID_WEB(agent, 'did:web', alias, agent_endpoint);
        }

        if (didPeerCount === 0) {
            await createDID_PEER(agent, 'did:peer', alias_peer, agent_endpoint);
        }

        if (didKeyCount === 0) {
            await createDID_KEY(agent, 'did:key', alias_key, agent_endpoint);
        }



        // If all types of DIDs exist, log the counts
        if (didWebCount > 0 && didPeerCount > 0 && didKeyCount > 0) {
            console.log(`There are ${didWebCount} did:web, ${didPeerCount} did:peer, and ${didKeyCount} did:key DIDs in the database.`);
        }


    } catch (error) {
        console.error(`Error in checkOrCreateDID: ${error.message}`);
        throw error;
    }
}

async function createDID_WEB(agent, provider, alias, agent_endpoint) {
    const identifier = await agent.didManagerCreate({
        provider: provider,
        alias: alias
    });

    // console.log("identifier_did_web",identifier)

    //TO ADD SERVICE 
    // const result = await agent.didManagerAddService({
    //     did: identifier.did,
    //     service: {
    //         id: `${alias}#msg`,
    //         type: 'Messaging',
    //         serviceEndpoint: 'https://verid.id/messaging',
    //         description: 'Handles incoming messages',
    //     },
    // })

    // console.log("result", result, identifier)
    // const testIdentifier = await agent.didManagerGet({ did: identifier.did })
    // console.log("testIdentifier", testIdentifier)

    try {
        const didDocument = await agent.resolveDid({ didUrl: identifier.did });
        console.log(`DID Document for ${identifier.did}:`);
        console.log(JSON.stringify(didDocument, null, 2));
        // Write the DID Document to a file
        await fs.writeFile('didWeb.json', JSON.stringify(didDocument, null, 2));
        console.log('DID Document written to didWeb.json');
    } catch (error) {
        console.error(`Failed to resolve DID Document: ${error.message}`);
    }

}

async function createDID_PEER(agent, provider, alias, agent_endpoint) {

    const identifier = await agent.didManagerCreate({
        provider: provider,
        alias: alias,
        "options": {
            "num_algo": 2, "service": { "id": "12344", "type": "DIDCommMessaging", "serviceEndpoint": `${agent_endpoint}/didcomm/message`, "description": "an endpoint" }
        }
    });

    // console.log("identifier_did_peer", identifier)
    try {
        const didDocument = await agent.resolveDid({ didUrl: identifier.did });
        console.log(`DID Document for ${identifier.did}:`);
        console.log(JSON.stringify(didDocument, null, 2));

        await fs.writeFile('didPeer.json', JSON.stringify(didDocument, null, 2));
        console.log('DID Document written to didPeer.json');
    } catch (error) {
        console.error(`Failed to resolve DID Document: ${error.message}`);
    }


}

async function createDID_KEY(agent, provider, alias, agent_endpoint) {
    const identifier = await agent.didManagerCreate({
        provider: provider,
        alias: alias,
        //  options: { keyType: 'X25519' },
        "options": {
            "num_algo": 2
        }
    });

    try {
        const didDocument = await agent.resolveDid({ didUrl: identifier.did });
        console.log(`DID Document for ${identifier.did}:`);
        console.log(JSON.stringify(didDocument, null, 2));

        await fs.writeFile('didKey.json', JSON.stringify(didDocument, null, 2));
        console.log('DID Document written to didKey.json');
    } catch (error) {
        console.error(`Failed to resolve DID Document: ${error.message}`);
    }
}
