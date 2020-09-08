import { h, render, } from "preact";
import { useReducer } from "preact/hooks";
import { useAuthState } from 'react-firebase-hooks/auth';
import firebase from 'firebase'

const firebaseConfig = {
    apiKey: "AIzaSyCuAFRc_YizyALHz6tTwGswcoIJtg9pz24",
    authDomain: "fir-auth-ipass-yarikiru.firebaseapp.com",
    databaseURL: "https://fir-auth-ipass-yarikiru.firebaseio.com",
    projectId: "fir-auth-ipass-yarikiru",
    storageBucket: "fir-auth-ipass-yarikiru.appspot.com",
    messagingSenderId: "284772338087",
    appId: "1:284772338087:web:c067a29123c90b2dcf4e82"
};

firebase.initializeApp(firebaseConfig);


const Main = () => {
    const [user, loading, error] = useAuthState(firebase.auth());
    return (
        <div>
            <h1>sign up</h1>
            <form onSubmit={(e) => {
                e.preventDefault()
                const target = e.target as any
                const email = target.email.value as string;
                const password = target.password.value as string;
                const auth = firebase.auth()
                auth.createUserWithEmailAndPassword(email, password)
            }}>
                <label>email</label>
                <input name='email' type='email'></input>
                <label>password(Password should be at least 6 characters)</label>
                <input name='password' type='password'></input>
                <label>confirm</label>
                <input name='confirm' type='password'></input>
                <button type='submit'>submit</button>
            </form>
            <h1>sign in</h1>
            {!user ?
                <div>
                    <h2>IPASS</h2>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        const target = e.target as any
                        const email = target.email.value as string;
                        const password = target.password.value as string;
                        firebase.auth().signInWithEmailAndPassword(email, password).then((d) => {
                            console.log('success > d', d)
                        }).catch(e => console.error('signin fail', e))
                    }}>
                        <label>email</label>
                        <input name='email' type='email'></input>
                        <label>password</label>
                        <input name='password' type='password'></input>
                        <button type='submit'>submit</button>
                    </form> <h2>メールリンク</h2>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        const target = e.target as any
                        const email = target.email.value as string;
                        const actionCodeSettings = {
                            // URL you want to redirect back to. The domain (www.example.com) for this
                            // URL must be whitelisted in the Firebase Console.
                            url: 'http://localhost:3000',
                            // This must be true.
                            handleCodeInApp: true,
                        };
                        firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings)
                            .then(function () {
                                window.localStorage.setItem('emailForSignIn', email);
                            })
                            .catch(function (error) {
                                // Some error occurred, you can inspect the code: error.code
                            });
                    }}>
                        <label>email</label>
                        <input name='email' type='email'></input>
                        <button type='submit'>submit</button>
                    </form></div> : <div>{user.email}{user.emailVerified ? 'メール認証済み' : 'アドレス未認証'}<button onClick={() => {
                        firebase.auth().signOut()
                    }}>logout</button>
                    <div>
                        <button onClick={() => {
                            user.sendEmailVerification()
                        }}>認証メールを送信</button>
                        <span>(メールリンクログインしてたら成功する)</span>
                    </div>
                    <h2>edit</h2>
                    <h3>email</h3>
                    <span>メアド変えたら確認メールが届く</span>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        const target = e.target as any
                        const email = target.email.value as string;
                        user.updateEmail(email).then(function () {
                            // Update successful.
                        }).catch(function (error) {
                            // An error happened.
                        });
                    }}>
                        <label>email</label>
                        <input type='email' name='email'></input><button type='submit'>submit</button>
                    </form>
                    <h3>password</h3>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        const target = e.target as any
                        const newPassword = target.password.value as string;
                        user.updatePassword(newPassword).then(function () {
                            // Update successful.
                        }).catch(function (error) {
                            // An error happened.
                        });
                    }}>
                        <label>password</label>
                        <input type='password' name='password'></input><button type='submit'>submit</button>
                    </form>
                </div>}
            <h2>password忘れ</h2>
            {user ? <div><a onClick={(e) => {
                e.preventDefault()
                firebase.auth().sendPasswordResetEmail(user.email)
            }}>password忘れはこちら</a> <a onClick={(e) => {
                e.preventDefault()
                const actionCodeSettings = {
                    url: 'https://localhost:3000/reset',
                    handleCodeInApp: true
                };
                firebase.auth().sendPasswordResetEmail(user.email, actionCodeSettings)
            }}>password忘れはこちら(カスタムUI)</a> </div> : <div><h3>指定したemailにpasswordを送信する</h3>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        const target = e.target as any
                        const email = target.email.value as string;
                        firebase.auth().sendPasswordResetEmail(email)
                    }}>
                        <label>email</label>
                        <input type='email' name='email'></input>
                    </form>
                </div>}

        </div>
    );
};

render(<Main></Main>, document.body);