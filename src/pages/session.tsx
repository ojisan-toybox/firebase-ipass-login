import { h, render } from "preact";
import { useEffect } from "preact/hooks";
import { useAuthState } from "react-firebase-hooks/auth";
import firebase from "firebase";

/** 実務では環境変数化するなどの工夫が必要 */
const REDIRECT_URL = "http://localhost:8080";

const firebaseConfig = {
  apiKey: "AIzaSyCuAFRc_YizyALHz6tTwGswcoIJtg9pz24",
  authDomain: "fir-auth-ipass-yarikiru.firebaseapp.com",
  databaseURL: "https://fir-auth-ipass-yarikiru.firebaseio.com",
  projectId: "fir-auth-ipass-yarikiru",
  storageBucket: "fir-auth-ipass-yarikiru.appspot.com",
  messagingSenderId: "284772338087",
  appId: "1:284772338087:web:c067a29123c90b2dcf4e82",
};

firebase.initializeApp(firebaseConfig);

const Session = () => {
  const [user] = useAuthState(firebase.auth());
  useEffect(() => {
    // Confirm the link is a sign-in with email link.
    if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
      // Additional state parameters can also be passed via URL.
      // This can be used to continue the user's intended action before triggering
      // the sign-in operation.
      // Get the email if available. This should be available if the user completes
      // the flow on the same device where they started it.
      let email = window.localStorage.getItem("emailForSignIn");
      if (!email) {
        // User opened the link on a different device. To prevent session fixation
        // attacks, ask the user to provide the associated email again. For example:
        email = window.prompt("Please provide your email for confirmation");
      }
      if (!email) {
        throw new Error("email should be");
      }
      // The client SDK will parse the code from the link for you.
      firebase
        .auth()
        .signInWithEmailLink(email, window.location.href)
        .then(function (result) {
          // Clear email from storage.
          window.localStorage.removeItem("emailForSignIn");
          // You can access the new user via result.user
          // Additional user info profile not available via:
          // result.additionalUserInfo.profile == null
          // You can check if the user is new or existing:
          // result.additionalUserInfo.isNewUser
        })
        .catch(function (error) {
          // Some error occurred, you can inspect the code: error.code
          // Common errors could be invalid email and invalid or expired OTPs.
          alert("すでに利用されているワンタイムパスワードです。");
          console.error(error);
        });
    }
  }, []);
  return (
    <div>
      {!user && (
        <section>
          <h1># sign up</h1>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const target = e.target as any;
              const email = target.email.value as string;
              const password = target.password.value as string;
              const auth = firebase.auth();
              try {
                await auth.createUserWithEmailAndPassword(email, password);
              } catch (e) {
                // FIXME: 実務ではちゃんとカスタムエラーオブジェクトを作ってinstance of で絞り込もうな
                alert(JSON.stringify(e.message));
              }
            }}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <label style={{ display: "block" }}>email</label>
            <input name="email" type="email"></input>
            <label style={{ display: "block" }}>
              password(Password should be at least 6 characters)
            </label>
            <input name="password" type="password"></input>
            <label style={{ display: "block" }}>confirm</label>
            <input name="confirm" type="password"></input>
            <button type="submit">submit</button>
          </form>
        </section>
      )}
      {!user ? (
        <div>
          <h1># sign in</h1>
          <h2>## IPASS</h2>
          <p>IDとPasswordを使ってログインできます。</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const target = e.target as any;
              const email = target.email.value as string;
              const password = target.password.value as string;
              firebase
                .auth()
                .signInWithEmailAndPassword(email, password)
                .then((d) => {
                  console.log("success > d", d);
                })
                .catch((e) => {
                  alert(e.message);
                });
            }}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <label style={{ display: "block" }}>email</label>
            <input name="email" type="email"></input>
            <label style={{ display: "block" }}>password</label>
            <input name="password" type="password"></input>
            <button type="submit">submit</button>
          </form>
          <h2>## メールリンク</h2>
          <p>
            送られてきたメールに付随するリンクを踏むことでログインできます。
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const target = e.target as any;
              const email = target.email.value as string;
              const actionCodeSettings = {
                // Firebase Consoleで予め許可リストに登録したリダイレクトURLを指定する
                url: REDIRECT_URL,
                // 今は必ず true.
                handleCodeInApp: true,
              };
              firebase
                .auth()
                .sendSignInLinkToEmail(email, actionCodeSettings)
                .then(function () {
                  window.localStorage.setItem("emailForSignIn", email);
                })
                .catch(function (error) {
                  // Some error occurred, you can inspect the code: error.code
                });
            }}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <label style={{ display: "block" }}>email</label>
            <input name="email" type="email"></input>
            <button type="submit">submit</button>
          </form>
        </div>
      ) : (
        <section>
          <h1># login中</h1>
          <div>
            <h2>## ユーザー状態</h2>
            <p>メールアドレス: {user.email}</p>
            <p>
              メールアドレス確認状態:
              {user.emailVerified ? "メール認証済み" : "アドレス未認証"}
            </p>
          </div>
          <h2>## ユーザーアクション</h2>
          <div>
            <button
              onClick={() => {
                firebase.auth().signOut();
              }}
            >
              ログアウトする
            </button>
          </div>
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => {
                user.sendEmailVerification();
              }}
              disabled={user.emailVerified}
            >
              認証メールを送信
            </button>
          </div>

          <h2>## ユーザー情報の編集</h2>
          <h3>### email</h3>
          <p>メアド変えたら確認のメールが届きます</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const target = e.target as any;
              const email = target.email.value as string;
              user
                .updateEmail(email)
                .then(function () {
                  alert("アドレスを更新しました");
                })
                .catch(function (error) {
                  // An error happened.
                });
            }}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <label style={{ display: "block" }}>email</label>
            <input type="email" name="email"></input>
            <button type="submit">submit</button>
          </form>
          <h3>### password</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const target = e.target as any;
              const newPassword = target.password.value as string;
              user
                .updatePassword(newPassword)
                .then(function () {
                  alert("パスワードを更新しました");
                })
                .catch(function (error) {
                  // An error happened.
                });
            }}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <label style={{ display: "block" }}>password</label>
            <input type="password" name="password"></input>
            <button type="submit">submit</button>
          </form>
        </section>
      )}
      <h1># password忘れの復旧</h1>
      {user ? (
        <div>
          <p>
            現在ログイン中のアドレスにパスワードのリセットメールを送信します。
          </p>
          <div style={{ display: "flex" }}>
            <button
              onClick={(e) => {
                if (!user.email) {
                  throw new Error("email should be");
                }
                e.preventDefault();
                firebase.auth().sendPasswordResetEmail(user.email);
                alert("mailを送信しました。");
              }}
              style={{ marginRight: 12 }}
            >
              password忘れはこちら
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                if (!user.email) {
                  throw new Error("email should be");
                }
                const actionCodeSettings = {
                  url: "https://localhost:3000/reset",
                  handleCodeInApp: true,
                };
                firebase
                  .auth()
                  .sendPasswordResetEmail(user.email, actionCodeSettings);
                alert("mailを送信しました。");
              }}
            >
              password忘れはこちら(カスタムUI)
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p>指定したemailにpassword編集画面へのリンクを送信します</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const target = e.target as any;
              const email = target.email.value as string;
              firebase.auth().sendPasswordResetEmail(email);
              alert("mailを送信しました。");
            }}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <label style={{ display: "block" }}>email</label>
            <input type="email" name="email"></input>
            <button type="submit">submit</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Session;
