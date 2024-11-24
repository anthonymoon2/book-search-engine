const typeDefs = `
    type User{
        _id: ID
        username: String
        email: String
        password: String
        bookCount: Int
        savedBooks: [Book]!
    }

    type Book {
        bookId: String!
        title: String
        authors: [String]
        description: String
        image: String
    }

    input BookInput{
        uid: String
        bookId: String
        title: String
        authors: [String]
        description: String
        image: String
    }

    input UserInput {
        username: String!
        email: String!
        password: String!
    }

    type Auth {
        token: ID!
        user: User
    }

    type Query {
        user(username: String!): User
        me: User
    }

    type MutationResponse {
        success: Boolean!
        message: String!
    }

    type Mutation {
        login(email: String!, password: String!): Auth
        addUser(input: UserInput!): Auth
        saveBook(input: BookInput!): Book
        deleteBook(uid: String, bookID: String): MutationResponse
    }
`;
export default typeDefs;
//# sourceMappingURL=typeDefs.js.map