import { h, } from "preact";
import { useState, useEffect } from "preact/hooks";
import firebase from "firebase";

const getParameterByName = (name: string) => {
    const url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

const Index = () => {
    const [state, setState] = useState<{ mode: string, actionCode: string } | null>(null)
    useEffect(() => {
        const mode = getParameterByName('mode')
        const actionCode = getParameterByName('oobCode')
        if (!mode || !actionCode) {
            throw new Error('invalid url')
        }
        setState({
            mode,
            actionCode
        })
    }, [])

    return <div>
        {state?.mode === 'resetPassword' ? <div>
            <form onSubmit={(e) => {
                e.preventDefault()
                const target = e.target as any
                const newPassword = target.password.value as string;
                firebase.auth().confirmPasswordReset(state.actionCode, newPassword).then(function (resp) {
                    // Password reset has been confirmed and new password updated.

                    // TODO: Display a link back to the app, or sign-in the user directly
                    // if the page belongs to the same domain as the app:
                    // auth.signInWithEmailAndPassword(accountEmail, newPassword);

                    // TODO: If a continue URL is available, display a button which on
                    // click redirects the user back to the app via continueUrl with
                    // additional state determined from that URL's parameters.
                    alert('success')
                }).catch(function (error) {
                    // Error occurred during confirmation. The code might have expired or the
                    // password is too weak.
                });
            }}>
                <label>new password</label>
                <input name='password' type='password'></input>
                <button type='submit'>submit</button>
            </form>
        </div> : <div>それ以外</div>}
    </div>
}

export default Index