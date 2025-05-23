import { graphql } from '@mysten/sui/graphql/schemas/latest';
import { SuiGraphQLClient } from '@mysten/sui/graphql';

export const queryDynamicFields = graphql(`
  query ($id: SuiAddress!) {
    owner(address: $id) {
      dynamicFields {
        nodes {
          value {
            __typename
            ... on MoveValue {
              json
            }
            ... on MoveObject {
              contents {
                json
              }
            }
          }
        }
      }
    }
  }
`);

export const queryField = graphql(`
  query GetDynamicField($address: String!, $type: String!, $bcs: Base64!) {
     object(address: $address) {
       dynamicField(
         name: { type: $type, bcs: $bcs }
       ) {
         value {
           ... on MoveValue {
             data
           }
           ... on MoveObject {
             contents {
               data
             }
           }
         }
       }
     }
   }
 `)

export const queryCoin = graphql(`
  query GetCoin($address: String!, $coinType: String!) {
    address(address: $address) {
      balance(type: $coinType) {
        totalBalance
      }
      coins(type: $coinType) {
        nodes {
          address  # 这就是对象ID
        }
      }
    }
  }
`)


export const gqlClient = new SuiGraphQLClient({
	url: 'https://sui-testnet.mystenlabs.com/graphql',
});