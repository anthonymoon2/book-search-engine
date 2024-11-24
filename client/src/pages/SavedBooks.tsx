import { useState, useEffect } from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';

import { getMe } from '../utils/API';
import Auth from '../utils/auth';

import type { User } from '../models/User';
import { useMutation, useQuery } from '@apollo/client';
import { QUERY_ME } from '../utils/mutations';
import { Book } from '../models/Book';
import { DELETE_BOOK } from '../utils/mutations';

const SavedBooks = () => {
  const [userData, setUserData] = useState<User>({
    username: '',
    email: '',
    password: '',
    savedBooks: [],
  });

  // use this to determine if `useEffect()` hook needs to run again
  const userDataLength = Object.keys(userData).length;

  // call ME query
  const { data } = useQuery(QUERY_ME);
  // add profile to variable
  const profile = data?.me || {};

  const profileName = profile?.username || '';
  console.log(`MY NAME! ${profileName}`);
  
  const profileIdString = profile?._id || '';
  console.log(`MY ID! ${profileIdString}`);
  
  const bookCount = profile?.bookCount || 0;
  console.log(`BOOK COUNT: ${bookCount}`);
  
  const myBooks = profile?.savedBooks || [];
  console.log(`MY BOOKS! ${JSON.stringify(myBooks)}`);

  // create mutation to delete book
  const [deleteBook] = useMutation(DELETE_BOOK);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const token = Auth.loggedIn() ? Auth.getToken() : null;

        if (!token) {
          return false;
        }

        const response = await getMe(token);

        if (!response.ok) {
          throw new Error('something went wrong!');
        }

        const user = await response.json();
        setUserData(user);

        //console.log(user);
      } catch (err) {
        console.error(err);
      }
    };

    getUserData();
  }, [userDataLength]);

  // create function that deletes book by calling mutation
  const handleDeleteBook = async (bookId: string) => {
    console.log(`uid ${profileIdString}`);
    console.log(`bookid ${bookId}`);

    try{
      const {data} = await deleteBook({
        variables: {
          uid: profileIdString,
          bookId: bookId
        }
      })

      console.log("Book deleted!")

      if (!data) {
        throw new Error('Something went wrong while deleting the book!');
      }
    } catch (err) {
      console.error('Error deleting book:', err);
    }
  };

  // if data isn't here yet, say so
  if (!userDataLength) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <div className='text-light bg-dark p-5'>
        <Container>
          {profileName ? (
            <h1>Viewing {profileName}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {bookCount ? `Viewing ${bookCount} saved ${bookCount === 1 ? 'book' : 'books'}:` : 'You have no saved books!'}
        </h2>

        <Row>
          {myBooks.length > 0 ? (
            myBooks.map((book: Book) => (
              <Col md='4' key={book.bookId}>
                <Card border='dark'>
                  {book.image && (
                    <Card.Img
                      src={book.image}
                      alt={`The cover for ${book.title}`}
                      variant='top'
                    />
                  )}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button
                      className='btn-block btn-danger'
                      onClick={() => handleDeleteBook(book._id)}
                    >
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <p>You have no saved books!</p>
          )}
        </Row>

      </Container>
    </>
  );
};

export default SavedBooks;
