import { Book, User } from "../models/index.js";
import { IUser } from "../models/User.js";
import { signToken, AuthenticationError } from "../services/auth.js";
import { Types } from "mongoose";

interface Context {
    user?: IUser | null;
}

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

interface SaveBookArgs{
    input: {
        uid: string
        bookId: string
        title: string
        authors: [string]
        description: string
        image: string
    }
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
        me: async (_parent: any, _args: any, context: Context) => {
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
            // create a new user with the provided username, email, and password
            const user = await User.create({ ...input });

            // Sign a token with the user's information
            const token = signToken(user.username, user.email, user._id);

            // Return the token and the user
            return { token, user };
        },

        saveBook: async (_: any, {input: { uid, bookId, title, description, image, authors }}: SaveBookArgs) => {
            try {
                // create a new book
                const book = await Book.create({
                    bookId: bookId,
                    title: title,
                    description: description,
                    image: image,
                    authors: authors
                });

                const user = await User.findById(uid);
                if (!user) {
                    throw new Error('User not found');
                }
                
                user.savedBooks.push(book._id as Types.ObjectId);
                await user.save();
                return book;
            } catch (err) {
                console.error("Error adding book: ", err);
                return null;
            }
        },

        deleteBook: async (_: any, {uid, bookID}: {uid: String, bookID: String}) => {
            try {

                console.log(`USER ID ${uid}`);
                console.log(`BOOK ID ${bookID}`);


                // find the User by id
                const user = await User.findById(uid);
                if (!user) {
                    throw new Error("User not found");
                }

                // find book by id
                const book = await Book.findOne({_id: bookID});
                if (!book) {
                    throw new Error("Book not found");
                }

                // remove the book's object id from the user's savedBooks Array
                user.savedBooks = user.savedBooks.filter(
                    (savedBookId) => savedBookId.toString() !== book._id.toString()
                );
                
                // save the updated user
                await user.save();

                // delete the book itself from the database
                await Book.findByIdAndDelete(book._id);
                
                // return message
                return {
                    success: true,
                    message: "Book deleted successfully",
                };
            } catch (err) {
                console.error("Error deleting book: ", err);
                return {
                    success: false,
                    message: "Failed to delete book",
                };
            }
        }
    }
};

export default resolvers;
