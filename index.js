import { gql, ApolloServer, UserInputError } from "apollo-server";
import { v1 as uuid } from "uuid";

const personData = [
  {
    name: "Seiya",
    age: 18,
    phone: "001-543-547",
    street: "Pegasus",
    city: "Rome",
    id: "001",
  },
  {
    name: "Shiryu",
    age: 18,
    street: "Dragon",
    city: "China",
    id: "002",
  },
  {
    name: "Hyoga",
    age: 17,
    phone: "003-364-034",
    street: "Cignus",
    city: "Siveria",
    id: "003",
  },
];

const typeDefs = gql`
  enum YesNo {
    YES
    NO
  }

  type Adrress {
    city: String!
    street: String!
  }

  type Person {
    name: String!
    age: Int!
    phone: String
    address: Adrress!
    check: String!
    canDrink: Boolean!
    id: ID!
  }

  type Query {
    personCount: Int!
    allPerson(phone: YesNo): [Person]!
    findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(
      name: String!
      age: Int!
      phone: String
      street: String!
      city: String!
    ): Person

    editPhone(name: String!, phone: String!): Person
  }
`;

const resolvers = {
  Query: {
    personCount: () => personData.length,
    allPerson: (root, args) => {
      if (!args.phone) return personData;

      const byPhone = (person) =>
        args.phone == "YES" ? person.phone : !person.phone;

      return personData.filter(byPhone);
    },
    findPerson: (root, args) => {
      const { name } = args;

      return personData.find(
        (el) => el.name.toLocaleLowerCase() == name.toLocaleLowerCase()
      );
    },
  },
  Mutation: {
    addPerson: (root, args) => {
      const exist = personData.find((el) => el.name == args.name);

      if (exist) {
        throw new UserInputError("Name must be unique", {
          invalidArgs: args.name,
        });
      }
      const person = { ...args, id: uuid() };
      personData.push(person); //update database with new person
      return person;
    },
    editPhone: (root, args) => {
      const personIndex = personData.findIndex(
        (el) => el.name.toLocaleLowerCase() == args.name.toLocaleLowerCase()
      );

      if (personIndex === -1) {
        return null;
      } else {
        const person = personData[personIndex];
        const updatePerson = { ...person, phone: args.phone };
        personData[personIndex] = updatePerson;
        return updatePerson;
      }
    },
  },
  Person: {
    address: (root) => {
      return { street: root.street, city: root.city };
    },
    check: () => "King",
    canDrink: (root) => root.age >= 18,
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
