import { User } from "../models/index.js";
import { signToken, AuthenticationError } from "../services/auth.js";

interface AddUserArgs {
    input: {
        username: string;
        email: string;
        password: string;
    }
}

// Define types for the arguments
interface LoginUserArgs {
    email: string;
    password: string;
  }
  
interface UserArgs {
    username: string;
}

const resolvers = {
    Query: {
        // get a single user
        user: async(_parent: any, { username }: UserArgs) => {
            const foundUser = await User.findOne({ username }).populate('savedBooks');

            return foundUser
        },

        // Query to get the authenticated user's information
        // The 'me' query relies on the context to check if the user is authenticated
        me: async (_parent: any, _args: any, context: any) => {
            // If the user is authenticated, find and return the user's information along with their thoughts
            if (context.user) {
                return User.findOne({ _id: context.user._id }).populate('savedBooks');
            }
            // If the user is not authenticated, throw an AuthenticationError
            throw new AuthenticationError('Could not authenticate user.');
        }
    },
    Mutation: {
        login: async (_parent: any, { email, password }: LoginUserArgs) => {
            const user = await User.findOne({ email });

            // If no user is found, throw an AuthenticationError
            if (!user) {
                throw new AuthenticationError('Could not authenticate user.');
            }

            // Check if the provided password is correct
            const correctPw = await user.isCorrectPassword(password);

            // If the password is incorrect, throw an AuthenticationError
            if (!correctPw) {
                throw new AuthenticationError('Could not authenticate user.');
            }

            // Sign a token with the user's information
            const token = signToken(user.username, user.email, user._id);

            // Return the token and the user
            return {token, user};
        },

        addUser: async (_parent: any, { input }: AddUserArgs) => {
            // create a new user with the rovided username, email, and password
            const user = await User.create({ ...input });

            // Sign a token with the user's information
            const token = signToken(user.username, user.email, user._id);

            // Return the token and the user
            return { token, user };
        }


    }
};

export default resolvers;
