import { ApolloServer, gql } from 'apollo-server-micro';
import { populateData } from './populateData';

let items = [];

const typeDefs = gql`
  type Item {
    id: ID!
    location: String!
    magnitude: Float!
    date: String!
  }

  type Query {
    items: [Item]
  }

  type Mutation {
    addItem(location: String!, magnitude: Float!, date: String!): Item
    updateItem(id: ID!, location: String!, magnitude: Float!, date: String!): Item
    deleteItem(id: ID!): Item
  }
`;

const resolvers = {
  Query: {
    items: () => items,
  },
  Mutation: {
    addItem: (_, { location, magnitude, date }) => {
      const newItem = { id: `${items.length + 1}`, location, magnitude, date };
      items.push(newItem);
      return newItem;
    },
    updateItem: (_, { id, location, magnitude, date }) => {
      const item = items.find(item => item.id === id);
      if (!item) throw new Error('Item not found');
      item.location = location;
      item.magnitude = magnitude;
      item.date = date;
      return item;
    },
    deleteItem: (_, { id }) => {
      const itemIndex = items.findIndex(item => item.id === id);
      if (itemIndex === -1) throw new Error('Item not found');
      const [deletedItem] = items.splice(itemIndex, 1);
      return deletedItem;
    },
  },
};

// Create Apollo Server instance
const apolloServer = new ApolloServer({ typeDefs, resolvers });

let serverStarted = false;

const startServer = async () => {
  if (!serverStarted) {
    await apolloServer.start();
    items = await populateData();
    serverStarted = true;
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  await startServer();
  const handler = apolloServer.createHandler({ path: '/api/graphql' });
  return handler(req, res);
}