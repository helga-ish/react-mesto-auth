import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './Header.js';
import Main from './Main.js';
import ImagePopup from './ImagePopup.js';
import Footer from './Footer.js';
import '../index.css';
import api from '../utils/api.js';
import { CurrentUserContext } from '../contexts/CurrentUserContext.js';
import EditProfilePopup from './EditProfilePopup.js';
import EditAvatarPopup from './EditAvatarPopup.js';
import AddPlacePopup from './AddPlacePopup.js';
import Register from './Register.js';
import Login from './Login.js';
import ProtectedRoute from "./ProtectedRoute";

function App() {
    

    const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(false);
    const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
    const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false);

    const [selectedCard, setSelectedCard] = React.useState({name:'', link:''});
    const [currentUser, setCurrentUser] = React.useState('');
    const [cards, setCards] = React.useState([]);
    const [loggedIn, setLoggedIn] = React.useState(false);
    // const [signedUp, setSignedUp] = React.useState(false);

    const handleLogin = () => {
        setLoggedIn(true);
      }

    React.useEffect(() => {
        api.getProfileUserInfo()
        .then((userData) => {
            setCurrentUser(userData);
        })
        .catch((error) => {
            console.error(`Ошибка загрузки данных пользователя с сервера: ${error}`);
        })
    }, []);

    React.useEffect(() => {
        api.getInitialCards()
        .then((data) => {
            setCards(
                data.map((item) => ({
                    id: item._id,
                    name: item.name,
                    link: item.link,
                    likes: item.likes,
                    owner: item.owner
                }))
                )
        })
        .catch((error) => {
            console.error(`Ошибка загрузки данных с сервера: ${error}`);
          });
    }, []);

    function handleCardLike(card) {
        const isLiked = card.likes.some(i => i._id === currentUser._id);
        
        api.changeLikeStatus(card.id, !isLiked)
        .then((newCard) => {
            setCards((state) => state.map((c) => c.id === card.id ? newCard : c));
        })
        .catch((error) => {
            console.error(`Ошибка загрузки данных с сервера: ${error}`);
        });
    }

    function handleDeleteClick(card) {
        api.deleteCard(card.id)
        .then(() => {
            setCards((state) => state.filter(function(c) {
                return c.id !== card.id;
            }))
        })
        .catch((error) => {
            console.error(`Ошибка загрузки данных с сервера: ${error}`);
        });
    }

    function handleCardClick(card) {
        setSelectedCard(card);
    }

    function handleEditAvatarClick() {
        setIsEditAvatarPopupOpen(true);
    };

    function handleEditProfileClick() {
        setIsEditProfilePopupOpen(true);
    };

    function handleAddPlaceClick() {
        setIsAddPlacePopupOpen(true);
    };


    function closeAllPopups() {
        setIsAddPlacePopupOpen(false);
        setIsEditAvatarPopupOpen(false);
        setIsEditProfilePopupOpen(false);
        setSelectedCard({name:'', link:''});
    }

    function handleUpdateUser(object) {
        api.changeProfileUserInfo(object)
        .then((newUserData) => {
            setCurrentUser(newUserData)
            closeAllPopups();
        })
        .catch((error) => {
            console.error(`Ошибка загрузки данных пользователя с сервера: ${error}`);
        });
    }

    function handleUpdateAvatar(link) {
        api.editAvatar(link)
        .then((dataAvatar) => {
            setCurrentUser(dataAvatar);
            closeAllPopups();
        })
        .catch((error) => {
            console.error(`Ошибка загрузки данных аватара пользователя с сервера: ${error}`);
        });
    }

    function handleAddPlaceSubmit(object) {
        api.addCard(object)
        .then((newCard) => {
            setCards([newCard, ...cards]);
            closeAllPopups();
        })
        .catch((error) => {
            console.error(`Ошибка загрузки данных нового места с сервера: ${error}`);
        })
    }

  return (
    <CurrentUserContext.Provider value={currentUser}>
            <div>
                <Header />
                <Routes>
                    <Route element={<ProtectedRoute exact path="/" loggedIn={loggedIn} component={Main}/>}>
                        <Route path='/' element={<Main 
                                                    onEditProfile={handleEditProfileClick}
                                                    onAddPlace={handleAddPlaceClick}
                                                    onEditAvatar={handleEditAvatarClick}
                                                    onCardClick={handleCardClick}
                                                    onCardLike={handleCardLike}
                                                    onDeleteClick={handleDeleteClick}
                                                    cards = {cards}
                                                />} 
                        />
                    </Route>
                    <Route   path='/sign-in' element={<Login handleLogin={handleLogin}/>} />
                    <Route   path='/sign-up' element={<Register />} />
                </Routes>

                <EditProfilePopup 
                            isOpen={isEditProfilePopupOpen}
                            onClose={closeAllPopups}
                            onUpdateUser={handleUpdateUser}
                            />
            
                            <EditAvatarPopup
                            isOpen={isEditAvatarPopupOpen}
                            onClose={closeAllPopups}
                            onUpdateAvatar={handleUpdateAvatar}
                            />
            
                            <AddPlacePopup
                            isOpen={isAddPlacePopupOpen}
                            onClose={closeAllPopups}
                            onAddPlace={handleAddPlaceSubmit}
                            />
            
                            <ImagePopup 
                            card = { selectedCard }
                            onClose = {closeAllPopups}
                            />

                            <Footer />

            </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
