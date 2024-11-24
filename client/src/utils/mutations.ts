import { gql } from '@apollo/client';

export const LOGIN_USER = gql`
    mutation login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            token
            user {
                email
                username
            }
        }
    }
`;

export const ADD_USER = gql`
    mutation Mutation($input: UserInput!) {
        addUser(input: $input){
            token
            user {
                username
                _id
            }
        }
    }
`;

export const SAVE_BOOK = gql`
    mutation Mutation($input: BookInput!) {
            saveBook(input: $input) {
            title
            image
            description
            bookId
            authors
        }
    }
`;

export const QUERY_ME = gql`
    query Me {
        me {
            username
            _id
            email
            bookCount
            savedBooks {
                title
                image
                description
                bookId
                authors
            }
        }
    }
`;

export const DELETE_BOOK = gql`
    mutation Mutation($uid: String, $bookId: String) {
        deleteBook(uid: $uid, bookID: $bookId) {
            success
            message
        }
    }
`
