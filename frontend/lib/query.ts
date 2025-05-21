import { graphql } from '@mysten/sui/graphql/schemas/latest';

const query = graphql(`
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