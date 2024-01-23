/* eslint-disable prettier/prettier */
// file: src/veramo/setup.ts
import {
  createAgent,
  IDIDManager,
  IResolver,
  IDataStore,
  IKeyManager,
  ICredentialPlugin,
  IMessageHandler,
  IEventListener,
} from '@veramo/core';
import { DIDManager } from '@veramo/did-manager';
import { KeyManager } from '@veramo/key-manager';
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { Resolver } from 'did-resolver';
import { getResolver as webDidResolver } from 'web-did-resolver';
import { WebDIDProvider } from '@veramo/did-provider-web';
import { Entities, KeyStore, DIDStore, PrivateKeyStore, migrations, DataStore, DataStoreORM } from '@veramo/data-store';
import { DataSource } from 'typeorm';
import { DIDComm, DIDCommHttpTransport, DIDCommMessageHandler, IDIDComm, CoordinateMediationRecipientMessageHandler, RoutingMessageHandler, CoordinateMediationMediatorMessageHandler } from '@veramo/did-comm';
import { MessageHandler } from '@veramo/message-handler';
import { getResolver as getDidPeerResolver, PeerDIDProvider } from '@veramo/did-provider-peer';
import { getDidKeyResolver, KeyDIDProvider } from '@veramo/did-provider-key'
import { IMediationManager, MediationManagerPlugin, MediationResponse, PreMediationRequestPolicy, RequesterDid } from '@veramo/mediation-manager';
import { KeyValueStore } from '@veramo/kv-store';


export async function createVeramoAgent(kmsSecretKey: string, fileName: string) {
  let dbConnection;
  try {
    dbConnection = await new DataSource({
      type: 'sqlite',
      database: fileName,
      synchronize: false,
      migrations,
      migrationsRun: true,
      logging: ['error'],
      entities: Entities,
    }).initialize();
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }

  const DIDCommEventSniffer: IEventListener = {
    eventTypes: ['DIDCommV2Message-sent', 'DIDCommV2Message-received', 'DIDCommV2Message-forwarded'],
    onEvent: async (event) => {
      console.log('Event Logged:', event);
      // Add your custom logic here
    },
  };
  const policyStore = new KeyValueStore<PreMediationRequestPolicy>({ store: new Map() })
  const mediationStore = new KeyValueStore<MediationResponse>({ store: new Map() })
  const recipientDidStore = new KeyValueStore<RequesterDid>({ store: new Map() })
  try {
    return createAgent<IDIDManager & IKeyManager & IDataStore & IMediationManager & IResolver & ICredentialPlugin & IMessageHandler & IDIDComm>({
      plugins: [
        new KeyManager({
          store: new KeyStore(dbConnection),
          kms: {
            local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, new SecretBox(kmsSecretKey))),
          },
        }),
        new DIDManager({
          store: new DIDStore(dbConnection),
          defaultProvider: 'did:peer',
          providers: {
            'did:web': new WebDIDProvider({
              defaultKms: 'local',
            }),
            'did:peer': new PeerDIDProvider({
              defaultKms: 'local',
            }),
            'did:key': new KeyDIDProvider({
              defaultKms: 'local',
            })
          },
        }),
        new DIDResolverPlugin({
          resolver: new Resolver({
            ...webDidResolver(),
            ...getDidPeerResolver(),
            ...getDidKeyResolver()
          }),
        }),
        new DIDComm({
          transports: [new DIDCommHttpTransport()]
        }),
        new MessageHandler({
          messageHandlers: [
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            new DIDCommMessageHandler(),
            new CoordinateMediationMediatorMessageHandler(),
            new CoordinateMediationRecipientMessageHandler(),
            new RoutingMessageHandler(),
          ],
        }),
        new DataStore(dbConnection),
        new DataStoreORM(dbConnection),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        new MediationManagerPlugin(true, policyStore, mediationStore, recipientDidStore),
        new CredentialPlugin(),
        DIDCommEventSniffer
      ],


    });
  } catch (error) {
    console.error("Failed to create Veramo agent", error);
    throw error;
  }
};
