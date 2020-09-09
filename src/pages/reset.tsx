import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import firebase from "firebase";

const getParameterByName = (name: string) => {
    const url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
};

/**
 * 諸々のresetを行うためのページ
 */
const Reset = () => {
    const [state, setState] = useState<{
        mode: string;
        actionCode: string;
    } | null>(null);
    useEffect(() => {
        const mode = getParameterByName("mode");
        const actionCode = getParameterByName("oobCode");
        if (!mode || !actionCode) {
            throw new Error("invalid url");
        }
        setState({
            mode,
            actionCode,
        });
    }, []);

    // magic link login
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
                    console.log('result', result)
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
            {state?.mode === "resetPassword" ? (
                <div>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const target = e.target as any;
                            const newPassword = target.password.value as string;
                            firebase
                                .auth()
                                .verifyPasswordResetCode(state.actionCode)
                                .then(function (email) {
                                    firebase
                                        .auth()
                                        .confirmPasswordReset(state.actionCode, newPassword)
                                        .then(async (resp) => {
                                            // ログインページか継続ページに戻すか、このページで直接ログインさせる
                                            await firebase
                                                .auth()
                                                .signInWithEmailAndPassword(email, newPassword);
                                            window.location.href = "/";
                                            alert("success");
                                        })
                                        .catch(function (error) {
                                            // エラーの原因としてはトークンの有効期限切れ、もしくは弱すぎるパスワード
                                            alert(error.message);
                                        });
                                });
                        }}
                    >
                        <label style={{ display: "block" }}>new password</label>
                        <input name="password" type="password"></input>
                        <button type="submit">submit</button>
                    </form>
                </div>
            ) : state?.mode === "signin" ? (
                "singin page"
            ) : (
                        <div>error: modeが選択されていない不正なURLです。</div>
                    )}
        </div>
    );
};

export default Reset;
