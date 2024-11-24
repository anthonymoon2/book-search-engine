import { Book, User } from "../models/index.js";
import { signToken, AuthenticationError } from "../services/auth.js";
const resolvers = {
    Query: {
        // get a single user
        user: async (_parent, { username }) => {
            const foundUser = await User.findOne({ username }).populate('savedBooks');
            return foundUser;
        },
        // Query to get the authenticated user's information
        // The 'me' query relies on the context to check if the user is authenticated
        me: async (_parent, _args, context) => {
            // If the user is authenticated, find and return the user's information along with their thoughts
            if (context.user) {
                return User.findOne({ _id: context.user._id }).populate('savedBooks');
            }
            // If the user is not authenticated, throw an AuthenticationError
            throw new AuthenticationError('Could not authenticate user.');
        }
    },
    Mutation: {
        login: async (_parent, { email, password }) => {
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
            return { token, user };
        },
        addUser: async (_parent, { input }) => {
            // create a new user with the provided username, email, and password
            const user = await User.create({ ...input });
            // Sign a token with the user's information
            const token = signToken(user.username, user.email, user._id);
            // Return the token and the user
            return { token, user };
        },
        saveBook: async (_, { input: { uid, bookId, title, description, image, authors } }) => {
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
                user.savedBooks.push(book._id);
                await user.save();
                return book;
            }
            catch (err) {
                console.error("Error adding book: ", err);
                return null;
            }
        },
        deleteBook: async (_, { uid, bookID }) => {
            try {
                console.log(`USER ID ${uid}`);
                console.log(`BOOK ID ${bookID}`);
                // find the User by id
                const user = await User.findById(uid);
                if (!user) {
                    throw new Error("User not found");
                }
                // find book by id
                const book = await Book.findOne({ _id: bookID });
                if (!book) {
                    throw new Error("Book not found");
                }
                // remove the book's object id from the user's savedBooks Array
                user.savedBooks = user.savedBooks.filter((savedBookId) => savedBookId.toString() !== book._id.toString());
                // save the updated user
                await user.save();
                // delete the book itself from the database
                await Book.findByIdAndDelete(book._id);
                // return message
                return {
                    success: true,
                    message: "Book deleted successfully",
                };
            }
            catch (err) {
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
//# sourceMappingURL=resolvers.js.map