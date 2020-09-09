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
