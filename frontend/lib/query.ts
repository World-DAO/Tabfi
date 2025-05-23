import { graphql } from '@mysten/sui/graphql/schemas/latest';
import { SuiGraphQLClient } from '@mysten/sui/graphql';

export const queryDynamicFields = graphql(`
  query ($id: SuiAddress!) {
    owner(address: $id) {
      dynamicFields {
        nodes {
          name {
            type {
              repr
            }
            json
          }
          value {
            __typename
            ... on MoveValue {
              type {
                repr
              }
              json
            }
            ... on MoveObject {
              contents {
                type {
                  repr
                }
                json
              }
            }
          }
        }
      }
    }
  }
`);

export const gqlClient = new SuiGraphQLClient({
	url: 'https://sui-testnet.mystenlabs.com/graphql',
});